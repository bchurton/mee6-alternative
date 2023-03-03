const { MessageEmbed, MessageAttachment } = require("discord.js");

module.exports = {
    name: "level",
    description: "Check your level!",
    aliases: ["lvl", "rank"],
    fun: true,
    public:true,
    async execute(client, message, args) {
        try {
            let user;

            if (args[0]) user = message.guild.members.cache.get(args[0].replace("<@", "").replace("!", "").replace(">", "")) || client.users.cache.get(args[0].replace("<@", "").replace("!", "").replace(">", "")) || await client.users.fetch(args[0].replace("<@", "").replace("!", "").replace(">", "")) || message.member
            else user = message.member;

            const card = await client.levelHandler.generateRankCard(user);
            const attachment = new MessageAttachment(card, "rank.png");
            await message.channel.send({ files: [attachment] });
        } catch (err) {
            console.log(err)
            message.channel.send(`An error occured: \`${err}\``)
        }
    }
}
