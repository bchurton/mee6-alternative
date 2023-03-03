module.exports = {
    name: "messageCreate",
    async execute(client, message) {
        if (message.author.bot) return
        if (!message.content.startsWith("<@" + client.user.id + ">") && !message.content.startsWith("<@!" + client.user.id + ">") && !message.content.startsWith(process.env.PREFIX)) { return }
        let split = message.content.split(" ");
        let search = split[1]
        if (message.content.startsWith(process.env.PREFIX)) search = split[0].slice(process.env.PREFIX.length)
        let command = client.commands.get(search) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(search));
        if (!command) return
        let i = 1;
        if (message.content.startsWith(process.env.PREFIX)) i++;
        while (i <= 2) {
            i++;
            split.shift();
        };
        
        if (!message.guild) return await message.reply(`My commands are disabled in DMs.`)

        await command.execute(client, message, split.filter(e => String(e).trim()) || []).catch(() => {})
    }
}


