function getLevelXp(n) {
    return Math.floor(100*(1.2**n))
}

function getLevelFromXp(xp) {
    let remaining_xp = Math.floor(xp)
    let level = 0
    while (remaining_xp >= getLevelXp(level)) {
        remaining_xp -= getLevelXp(level)
        level += 1
    }
    return level
}

module.exports.getLevelXp = getLevelXp
module.exports.getLevelFromXp = getLevelFromXp