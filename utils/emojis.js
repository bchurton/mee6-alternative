module.exports.init = function (client) {
    client.error = (msg) => { return `<:bot_error:1053483025834451077> ${msg}` }
    client.success = (msg) => { return `<:bot_success:1053482876018110484> ${msg}` }
    client.critical = (msg) => { return `<:bot_warning:1053483028451700737> ${msg}` }
}