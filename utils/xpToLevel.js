// calculate level from xp
// examples:
// 1554621 xp = level 93
// 2730810 xp = level 113
// 1986665 xp = level 101
// 2722540 xp = level 113
// 1330029 xp = level 88

module.exports.neededXP = function (xp, lvl) {
    return Math.round(5 * (lvl ^ 2) + (50 * lvl) + 100 - xp);
}