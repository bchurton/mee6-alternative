function nextLevel(xp, lvl) {
    let res = 0; 
    for (let i = 0; i < lvl; i++) res += (5 * Math.pow(i, 2) + 50 * i + 100)
    console.log(`Res: ${res} | XP: ${xp} | Level: ${lvl} | Next: ${res - xp} | Sign: ${Math.sign(res - xp)}`)
    console.log(`Level ${lvl} needs ${res - xp} more xp`)
    return res - xp
  } 

function getLevel(xp) {
    for (let lvl = 0; lvl < 100; lvl++) {
        const next = nextLevel(xp, lvl);
        if (Math.sign(next) >= 0) {
            return lvl - 1
        }
    }
    return 0
}

module.exports.getLevel = getLevel;
module.exports.nextLevel = nextLevel;