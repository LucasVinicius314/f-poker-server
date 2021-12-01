class Card {
    constructor(sign, number, suit, holder) {
        this.sign = sign
        this.number = number
        this.suit = suit
        this.holder = holder
    }
    sign = null
    number = 0
    suit = null
    holder = null
    toString() { return this.sign }
}

var nums = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
var suits = ["♦", "♣", "♥", "♠"];

function createDeck() {
    let deck = []
    for (let s = 0; s < 4; s++) {
        for (let n = 0; n < 13; n++) {
            deck[13 * s + n] = new Card(suits[s] + nums[n], n, s, null)
        }
    }
    deck = deck.sort((a, b) => Math.random() - .5)
    return deck
}

function evaluateHand(combo) {
    combo.sort((a, b) => b.number - a.number)
    let n = ''
    let s = ''
    let flush
    let straight
    let royal
    let stfl
    let quad
    let trio
    let pair
    let secondPair
    let housePair
    let bestHand
    let evaluatedCombo = []

    combo.forEach(element => {
        n = n.concat(nums[element.number])
        s = s.concat(suits[element.suit])
    });
    // n = 'K965432'   // debug this
    // s = '♥♥♥♠♣♥♠'

    console.log(n + "\n" + s + "\n" + combo)

    flush = s[s.search(/(♦.*){5}|(♣.*){5}|(♥.*){5}|(♠.*){5}/)] ?? -1
    straight = n.search(/(A+K+Q+J+T+|K+Q+J+T+9+|Q+J+T+9+8+|J+T+9+8+7+|T+9+8+7+6+|9+8+7+6+5+|8+7+6+5+4+|7+6+5+4+3+|6+5+4+3+2|A+.*5+4+3+2+)/)
    const flushString = n.split('').filter((f, k) => s[k] == flush).join('')
    stfl = flushString.search(/(A+K+Q+J+T+|K+Q+J+T+9+|Q+J+T+9+8+|J+T+9+8+7+|T+9+8+7+6+|9+8+7+6+5+|8+7+6+5+4+|7+6+5+4+3+|6+5+4+3+2|A+.*5+4+3+2+)/)
    royal = stfl != -1 ? flushString.search('A') : -1
    console.log(flushString)
    quad = n.search(/(.)\1{3}/)
    trio = n.search(/(.)\1{2}/)
    pair = n.search(/(.)\1/)
    secondPair = n.search(Array.from(n.match(/(\w)\1/g) ?? [null, null])[1] ?? 'x')
    if (trio != -1) {
        if (pair != -1 && pair != trio)
            housePair = pair
        else if (secondPair != -1 && secondPair != trio)
            housePair = secondPair
        else
            housePair = -1
    }
    else housePair = -1
    //console.log(`Pair: ${pair}\nSecond Pair: ${secondPair}\nTrio: ${trio}\nHouse Pair: ${housePair}\nStraight: ${straight}\nQuad: ${quad}\nFlush: ${flush}\nstfl: ${stfl}\nRoyal: ${royal}`)

    if (royal != -1) {
        bestHand = 'Royal Flush'
        if (n.search(/(A+.*5+4+3+2+)/) != -1) {
            for (let i = 3; i >= 0; i--) {
                if (evaluatedCombo.length == 4) {
                    break
                }
                for (let j = 0; j < 7; j++) {
                    if (n[j] == nums[i] && s[j] == flush) {
                        evaluatedCombo.push(combo[j])
                        break
                    }
                }
            }
            evaluatedCombo[4] = combo[stfl]
        }
        else {
            for (let i = nums.indexOf(n[straight]); i > nums.indexOf(n[straight]) - 5; i--) {
                if (evaluatedCombo.length == 5) {
                    break
                }
                for (let j = 0; j < 7; j++) {
                    if (n[j] == nums[i] && s[j] == flush) {
                        evaluatedCombo.push(combo[j])
                        break
                    }
                }
            }
        }
    }
    else if (stfl != -1) {
        bestHand = 'Straight Flush'
        if (n.search(/(A+.*5+4+3+2+)/) != -1) {
            for (let i = 3; i >= 0; i--) {
                if (evaluatedCombo.length == 4) {
                    break
                }
                for (let j = 0; j < 7; j++) {
                    if (n[j] == nums[i] && s[j] == flush) {
                        evaluatedCombo.push(combo[j])
                        break
                    }
                }
            }
            evaluatedCombo[4] = combo[stfl]
        }
        else {
            for (let i = nums.indexOf(n[straight]); i > nums.indexOf(n[straight]) - 5; i--) {
                if (evaluatedCombo.length == 5) {
                    break
                }
                for (let j = 0; j < 7; j++) {
                    if (n[j] == nums[i] && s[j] == flush) {
                        evaluatedCombo.push(combo[j])
                        break
                    }
                }
            }
        }
    }
    else if (quad != -1) {
        bestHand = 'Four of a Kind'
        evaluatedCombo[0] = combo[quad]
        evaluatedCombo[1] = combo[quad + 1]
        evaluatedCombo[2] = combo[quad + 2]
        evaluatedCombo[3] = combo[quad + 3]
        combo.forEach((element, index) => {
            if (evaluatedCombo.length < 5 && (index > quad + 3 || index < quad)) {
                evaluatedCombo.push(combo[index])
            }
        })
    }
    else if (housePair != -1) {
        bestHand = 'Full House'
        evaluatedCombo[0] = combo[trio]
        evaluatedCombo[1] = combo[trio + 1]
        evaluatedCombo[2] = combo[trio + 2]
        evaluatedCombo[3] = combo[housePair]
        evaluatedCombo[4] = combo[housePair + 1]
    }
    else if (flush != -1) {
        bestHand = 'Flush'
        combo.forEach((element, index) => {
            if (evaluatedCombo.length < 5 && suits[element.suit] == flush) {
                evaluatedCombo.push(combo[index])
            }
        })
    }
    else if (straight != -1) {
        bestHand = 'Straight'
        if (n.search(/(A+.*5+4+3+2+)/) != -1) {
            for (let i = 3; i >= 0; i--) {
                if (evaluatedCombo.length == 4) {
                    break
                }
                for (let j = 0; j < 7; j++) {
                    if (n[j] == nums[i]) {
                        evaluatedCombo.push(combo[j])
                        break
                    }
                }
            }
            evaluatedCombo[4] = combo[straight]
        }
        else {
            for (let i = nums.indexOf(n[straight]); i > nums.indexOf(n[straight]) - 5; i--) {
                if (evaluatedCombo.length == 5) {
                    break
                }
                for (let j = 0; j < 7; j++) {
                    if (n[j] == nums[i]) {
                        evaluatedCombo.push(combo[j])
                        break
                    }
                }
            }
        }
    }
    else if (trio != -1) {
        bestHand = 'Three of a kind'
        evaluatedCombo[0] = combo[trio]
        evaluatedCombo[1] = combo[trio + 1]
        evaluatedCombo[2] = combo[trio + 2]
        combo.forEach((element, index) => {
            if ((evaluatedCombo.length < 5) && (index < trio || index > trio + 2)) {
                evaluatedCombo.push(element)
            }
        })
    }
    else if (secondPair != -1) {
        bestHand = 'Two Pairs'
        evaluatedCombo[0] = combo[pair]
        evaluatedCombo[1] = combo[pair + 1]
        evaluatedCombo[2] = combo[secondPair]
        evaluatedCombo[3] = combo[secondPair + 1]
        combo.forEach((element, index) => {
            if (evaluatedCombo.length < 5 && index != pair && index != pair + 1 && index != secondPair && index != secondPair + 1) {
                evaluatedCombo.push(combo[index])
            }
        })
    }
    else if (pair != -1) {
        bestHand = 'Pair'
        evaluatedCombo[0] = combo[pair]
        evaluatedCombo[1] = combo[pair + 1]
        combo.forEach((element, index) => {
            if (evaluatedCombo.length < 5 && index != pair && index != pair + 1) {
                evaluatedCombo.push(combo[index])
            }
        })
    }
    else {
        bestHand = 'High Card'
        combo.forEach((element, index) => {
            if (evaluatedCombo.length < 5) {
                evaluatedCombo.push(combo[index])
            }
        })
    }



    console.log(bestHand)
    console.log(evaluatedCombo)
    console.log()
}