const key = {
    arrowup: false,
    arrowleft: false,
    arrowright: false,

    w: false,
    a: false,
    d: false,

    z: false,
    q: false,

    x: false,
    space: false,
    ' ': false,
    enter: false,
    shift: false
}

const mouse = {
    x: 0,
    y: 0,
    worldX: 0,
    worldY: 0
}

const charging = {
    active: false,
    startTime: 0,
    maxChargeTime: 3000,
    chargeLevel: 0,
    ammoConsumed: 0,
    lastAmmoTime: 0
}

function initializeInput() {
    addEventListener('mousemove', e => {
        const rect = cvs.getBoundingClientRect()
        mouse.x = e.clientX - rect.left
        mouse.y = e.clientY - rect.top

        mouse.worldX = (mouse.x / scale) + (cam.offset_x / scale)
        mouse.worldY = (mouse.y / scale) + (cam.offset_y / scale)
    })

    addEventListener('keydown', e => {
        if (e.repeat) return

        if (e.key === ' ') {
            if (!charging.active && hero.health && ~~hero.power && gameState === 'playing') {
                charging.active = true
                charging.startTime = Date.now()
                charging.ammoConsumed = 0
                charging.lastAmmoTime = Date.now()
            }
            key.space = true
            key[' '] = true
        }

        if (e.key === 'Enter') {
            key.enter = true
        }

        if (e.key === 'Shift') {
            key.shift = true
        }

        if (key[e.key.toLowerCase()] != undefined)
            key[e.key.toLowerCase()] = true

        if (e.key == 'x' && hero.health && ~~hero.power && gameState === 'playing') hero.throw()

        if (e.key === 'Shift' && hero.health && gameState === 'playing') hero.dash()
    })

    addEventListener('keyup', e => {
        if (e.key === ' ') {
            if (charging.active && hero.health && gameState === 'playing') {
                hero.throw()
            }
            charging.active = false
            charging.startTime = 0
            charging.chargeLevel = 0
            charging.ammoConsumed = 0
            charging.lastAmmoTime = 0
            key.space = false
            key[' '] = false
        }

        if (e.key === 'Enter') {
            key.enter = false
        }

        if (e.key === 'Shift') {
            key.shift = false
        }

        if (key[e.key.toLowerCase()] != undefined)
            key[e.key.toLowerCase()] = false
    })
}

function updateCharging() {
    if (charging.active) {
        const currentTime = Date.now()
        const prevChargeLevel = charging.chargeLevel

        const timeSinceLastAmmo = currentTime - charging.lastAmmoTime
        if (timeSinceLastAmmo >= 1000 && charging.ammoConsumed < 3 && hero.power > 0) {
            hero.power -= 1
            charging.ammoConsumed += 1
            charging.lastAmmoTime = currentTime

            charging.startTime = currentTime
        }

        let targetChargeLevel = 0
        const elapsed = currentTime - charging.startTime
        const progressWithinSecond = Math.min(1, elapsed / 1000)

        const baseChargeFromAmmo = charging.ammoConsumed / 3

        if (hero.power > 0 || charging.ammoConsumed === 0) {
            const additionalCharge = progressWithinSecond / 3
            targetChargeLevel = Math.min(1, baseChargeFromAmmo + additionalCharge)
        } else {
            targetChargeLevel = baseChargeFromAmmo
        }

        charging.chargeLevel = targetChargeLevel

        if (hero.power > 0 && charging.ammoConsumed < 3 && charging.lastAmmoTime === 0) {
            charging.lastAmmoTime = currentTime
            charging.startTime = currentTime
        }

        if (prevChargeLevel < 1 && charging.chargeLevel >= 1) {
            cam.shake = 10
            cam.shift = 0.005

            for (let i = 0; i < 8; i++) {
                screen.numbers.push(new Number({
                    x: hero.x + hero.width / 2 + random(-0.4, 0.4, 0),
                    y: hero.y + hero.height / 2 + random(-0.4, 0.4, 0),
                    speed_x: random(-3, 3, 0),
                    speed_y: random(-4, -1, 0),
                    text: '★',
                    color: [255, 255, 0, 255],
                    fade_speed: 3
                }))
            }
        }
    }
}
