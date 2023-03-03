const { MongoClient } = require('mongodb');
const Redis = require('ioredis');
const { neededXP } = require("./xpToLevel")
const canvacord = require("canvacord");
const { GuildMember } = require("discord.js")

class LevelHandler {
    constructor(client, options) {
        if (!options) throw new Error("No options provided")
        if (!options?.mongo) throw new Error("No mongo config provided")
        if (!options?.redis) throw new Error("No redis config provided")
        if (!options?.mongo?.uri || !options?.mongo?.db || !options?.mongo?.collection) throw new Error("Invalid mongo config")
        if (!options?.redis?.uri) throw new Error("Invalid redis config")

        this.mongoClient = new MongoClient(options.mongo.uri, { useUnifiedTopology: true });
        this.redis = new Redis(options.redis.uri);

        this.mongoClient.connect().then(() => {
            this.mongo = this.mongoClient.db(options.mongo.db).collection(options.mongo.collection)
            console.log("Mongo connected")
        })

        this.redis.on('connect', () => {
            console.log("Redis connected")
        })

        if (options.levelUpChannel) {
            (async () => {
                this.levelUpChannel = client.channels.cache.get(options.levelUpChannel) || await client.channels.fetch(options.levelUpChannel)
            })()
            this.levelUpMessage = options.levelUpMessage || "Congrats {user}! You just leveled up to level {level}!"
        }

    }

    async getLevel(id) {
        const cached = await this.redis.get(id)
        if (cached) return JSON.parse(cached)

        const levelDB = await this.mongo.findOne({ id })
        const currentXP = levelDB?.xp?.levelXp || 0
        const currentLevel = levelDB.level || 0
        const xpNeeded = neededXP(currentXP, currentLevel + 1)

        await this.redis.set(`level_${id}`, JSON.stringify({ level: currentLevel, xp: currentXP, xpNeeded }))
        return { level: currentLevel, xp: currentXP, xpNeeded }
    }

    async addXp(id, xp) {
        const levelDB = await this.mongo.findOne({ id })
        const newLevelXp = levelDB?.xp?.levelXp ? levelDB.xp.levelXp + xp : xp

        await this.redis.del(`level_${id}`)
        await this.mongo.updateOne({ id }, { $set: { xp: { levelXp: newLevelXp } } }, { upsert: true })

        return newLevelXp
    }

    async getXPToNextLevel(id) {
        const { level } = await this.getLevel(id)
        return levelToXp(level + 1)
    }

    async getRank(id) {
        const { level } = await this.getLevel(id)
        const rank = await this.mongo.countDocuments({ "xp.levelXp": { $gt: levelToXp(level) } })
        return rank
    }

    async getLeaderboard() {
        const cached = await this.redis.get("leaderboard")
        if (cached) return JSON.parse(cached)

        const leaderboard = await this.mongo.find({}).sort({ "xp.levelXp": -1 }).toArray()

        await this.redis.set("leaderboard", JSON.stringify(leaderboard), 'EX', 300) // 5 minutes

        return leaderboard
    }

    async cooldownHandler(id) {
        const cached = await this.redis.get(`cooldown_${id}`)
        if (cached) return true

        await this.redis.set(`cooldown_${id}`, true, 'EX', 60) // 1 minute
        return false
    }
    
    async getLeaderboardPage(page) {
        const leaderboard = await this.getLeaderboard()
        const pageStart = page * 10
        const pageEnd = pageStart + 10
        return leaderboard.slice(pageStart, pageEnd)
    }

    async getLeaderboardPageCount() {
        const leaderboard = await this.getLeaderboard()
        return Math.ceil(leaderboard.length / 10)
    }

    async getLeaderboardPosition(id) {
        const leaderboard = await this.getLeaderboard()
        return leaderboard.findIndex(user => user.id === id) + 1
    }

    async generateRankCard(member) {
        const status = typeof member === GuildMember ? member.presence.status : "online"

        const { level, xp, xpNeeded } = await this.getLevel(member.id)

        const rank = new canvacord.Rank()
            .setAvatar(member.displayAvatarURL({ format: "png", size: 1024 }))
            .setCurrentXP(xp)
            .setRequiredXP(xpNeeded)
            .setStatus(status)
            .setProgressBar("#FFFFFF", "COLOR")
            .setUsername(member?.user ? member.user.username : member.username)
            .setDiscriminator(member?.user ? member.user.discriminator : member.discriminator)

        return rank.build()
    }

    async sendLevelUpMessage(message, level) {
        if (!this.levelUpChannel) return
        await this.levelUpChannel.send(this.levelUpMessage.replace("{user}", `<@${message.author}>`).replace("{level}", level))
    }
}

module.exports = LevelHandler