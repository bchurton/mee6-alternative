module.exports = {
    name: "messageCreate",
    async execute(client, message) {
        return;
        if (message.author.bot) return
        if (!message.guild) return
    
        const cooldown = await client.levelHandler.cooldownHandler(message.author.id)
        if (cooldown) return // if they're on cooldown, don't add xp

        const xp = Math.floor(Math.random() * 10) + 1 // random number between 10 and 50
        const { level: currentLevel } = await client.levelHandler.getLevel(message.author.id)
        const newTotalXp = await client.levelHandler.addXp(message.author.id, xp)
        const { level: newLevel } = await client.levelHandler.getLevel(message.author.id)

        if (currentLevel !== newLevel) {
            const rank = await client.levelHandler.getRank(message.author.id)
            const xpToNextLevel = await client.levelHandler.getXPToNextLevel(message.author.id)
            const embed = new MessageEmbed()
                .setColor("RANDOM")
                .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
                .setDescription(`You just advanced to level ${newLevel}! You are now rank ${rank}! You need ${xpToNextLevel} more xp to level up!`)
                .setFooter(`Total xp: ${newTotalXp}`)
            message.channel.send({ embeds: [embed] })
        }
    }
}