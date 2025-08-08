// Robot classes: Robot (base), Player, Enemy, Clone

class Robot extends Base {
    constructor(x, y, width, height) {
        super()

        this.x = x
        this.y = y
        this.width = width
        this.height = height

        this.land_on_side = false
        this.speed_y = 0

        this.in_air = true
        this.blink = {
            time: 0,
            active: false,
            value: 0
        }
        this.dir = {
            face: 1,
            move: 0
        }
    }

    death(color) {
        this.dir.move = 0
        this.collideGround()
        this.drawDie(0, 0, color)
    }

    jump(force) {
        this.speed_y = -force
        this.in_air = true
    }

    body(main_color, face_color) {
        ctx.fillStyle = main_color
        stretchRect(0, 0, 1, .4, this) // head
        stretchRect(.44, .4, .12, .2, this) // neck
        stretchRect(0, .5, 1, .5, this) // body

        ctx.fillStyle = face_color
        stretchRect(.1, .1, .8, .2, this) // face
    }

    arm(x, y, color) {
        const arm_size = .1
        ctx.fillStyle = color
        stretchRect(x + .5 - arm_size / 2, y, arm_size, arm_size, this)
    }

    eye(x, y, color, eyelid_color) {
        const eye_size = .12

        ctx.fillStyle = color
        stretchRect(x + .5 - eye_size / 2, y, eye_size, eye_size, this)

        this.blink.time --

        if (this.blink.time < 0) this.blink.active = true

        if (this.blink.active) {
            this.blink.value += .1
            const pad = .01

            if (this.blink.value > Math.PI) {
                this.blink.value = 0
                this.blink.time = random(0, 500)
                this.blink.active = false
            }

            ctx.fillStyle = eyelid_color
            stretchRect(
                (x + .5 - eye_size / 2) - pad,
                (y + eye_size) + pad,
                eye_size + pad * 2,
                (-Math.sin(this.blink.value) * eye_size) - pad * 2, this
            )
        }
    }

    drawDie(x, y, color) {
        ctx.fillStyle = color
        stretchRect(x, y + .5, 1, .5, this)
    }

    collideGround() {
        const arr = [{
            x: Math.floor(this.x + this.width),
            y: -map.array[Math.floor(this.x + this.width)],
            width: 1, height: map.array[Math.floor(this.x + this.width)]
        },{
            x: Math.floor(this.x),
            y: -map.array[Math.floor(this.x)],
            width: 1, height: map.array[Math.floor(this.x)]
        }]

        let collision = false

        arr.forEach(obj => {
            if (collide(this, obj)) {
                const overlap = merge(this, obj)
                collision = true

                if (overlap.x) {
                    this.x -= overlap.x
                    this.land_on_side = true
                }
                else {
                    this.y -= overlap.y
                    this.speed_y = 0
                    this.in_air = false
                }
            }
        })

        if (!collision) this.land_on_side = false

        if (this.x < 0) this.x -= this.x
        if (this.x + this.width > map.width)
            this.x += map.width - (this.x + this.width)
    }
    
    update() {
        this.y += this.speed_y
        this.speed_y += gravity

        this.x += this.dir.move * this.speed
        if (this.x <= 0) {
            this.dir.move = 1
            this.dir.face = 1
        }
        if (this.x >= map.width - this.width) {
            this.dir.move = -1
            this.dir.face = -1
        }

        if (this.speed_y > .5) this.speed_y = .5
    }
}

class Player extends Robot {
    constructor(width, height) {
        super(0, 0, width, height)

        this.speed = .05
        this.max_power = 20
        this.upgrades = ['seed', 'seed bomb', 'cloner']

        this.reset()
    }

    reset() {
        if (map.level < map.level_end)
            this.upgrade = this.upgrades[
                Math.ceil((map.level + 1) / (map.level_end / this.upgrades.length)) - 1
            ]
        else this.upgrade = ''

        this.hit = false
        this.recover_time = 0
        this.health = playerUpgrades.maxHealth
        this.power = 0
        this.shot_count = 0
        
        this.abilityCounters = {}
        
        // Skills tracking
        this.jumpCount = 0  // Track number of jumps used (0 = can jump, 1 = used ground jump, 2 = used double jump)
        this.dashCooldown = 0  // Dash cooldown timer
        this.dashCooldownMax = 120  // 3 seconds at 60fps
        this.dashTrail = []  // Array to store dash trail positions
        this.prevJumpPressed = false  // Track previous frame jump key state for double jump
        this.dashActive = false  // Whether player is currently dashing
        this.dashDuration = 0  // How long the dash lasts
        this.dashMaxDuration = 15  // Dash duration in frames
        this.dashDirection = 0  // Direction of the dash

        this.x = .35
        this.y = -10
    }

    recover() {
        Math.floor(this.recover_time / 10) % 2 ? this.draw() : 0
    }

    throw() {
        this.shot_count++
        
        // calculate charge multiplier (1x to 2x based on charge level)
        const chargeMultiplier = 1 + charging.chargeLevel
        const baseDamage = playerUpgrades.baseDamage * playerUpgrades.damageMultiplier * chargeMultiplier
        
        // calculate direction from player to mouse cursor
        const playerCenterX = this.x + this.width / 2
        const playerCenterY = this.y + this.height / 2
        
        const deltaX = mouse.worldX - playerCenterX
        const deltaY = mouse.worldY - playerCenterY
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        
        const baseSpeed = 0.1 * chargeMultiplier
        let speed_x = 0
        let speed_y = 0
        
        if (distance > 0) {
            speed_x = (deltaX / distance) * baseSpeed
            speed_y = (deltaY / distance) * baseSpeed
        } else {
            speed_x = baseSpeed * this.dir.face
            speed_y = -0.05
        }
        
        playerUpgrades.abilities.forEach((ability, index) => {
            if (!(ability in this.abilityCounters)) {
                const numAbilities = playerUpgrades.abilities.length
                const spacing = Math.max(1, Math.floor(5 / numAbilities))
                const offset = Math.floor(5 * (index + 1) / (numAbilities + 1))
                this.abilityCounters[ability] = offset
            }
        })
        
        let usedAbility = null
        let nextAbilityShot = Infinity
        let nextAbilityName = ''
        
        for (let ability of playerUpgrades.abilities) {
            if (this.shot_count === this.abilityCounters[ability]) {
                usedAbility = ability
                this.abilityCounters[ability] += 5 // Next shot for this ability is 5 shots later
                break
            }
        }
        
        for (let ability of playerUpgrades.abilities) {
            if (this.abilityCounters[ability] > this.shot_count && this.abilityCounters[ability] < nextAbilityShot) {
                nextAbilityShot = this.abilityCounters[ability]
                nextAbilityName = ability
            }
        }
        
        const seedConfig = {
            x: playerCenterX,
            y: playerCenterY,
            width: .1 * (0.8 + 0.4 * charging.chargeLevel), // Size scales with charge
            height: .1 * (0.8 + 0.4 * charging.chargeLevel),
            speed_x: speed_x,
            speed_y: speed_y,
            life_time: 100 + Math.floor(100 * charging.chargeLevel), // Longer travel time when charged
            damage: baseDamage,
            chargeLevel: charging.chargeLevel // Pass charge level for visual effects
        }
        
        if (usedAbility === 'homing') {
            map.used_power.push(
                new HomingSeed({
                    ...seedConfig,
                    width: .08 * (0.8 + 0.4 * charging.chargeLevel),
                    height: .08 * (0.8 + 0.4 * charging.chargeLevel),
                    life_time: 300 + Math.floor(200 * charging.chargeLevel)
                })
            )
        } else if (usedAbility === 'explosive') {
            map.used_power.push(
                new ExplosiveSeed({
                    ...seedConfig,
                    width: .09 * (0.8 + 0.4 * charging.chargeLevel),
                    height: .09 * (0.8 + 0.4 * charging.chargeLevel),
                    life_time: 120 + Math.floor(80 * charging.chargeLevel),
                    damage: baseDamage * 3 // Explosive already has damage multiplier
                })
            )
        } else if (usedAbility === 'seedbomb') {
            map.used_power.push(
                new SeedBomb({
                    ...seedConfig,
                    life_time: 200 + Math.floor(100 * charging.chargeLevel),
                    plant: {
                        color: [0],
                        min_growth: 1,
                        max_growth: 5,
                        stem_limit_min: 5,
                        stem_limit_max: 10
                    }
                })
            )
        } else if (usedAbility === 'cloner') {
            map.used_power.push(
                new Cloner({
                    ...seedConfig,
                    life_time: 100 + Math.floor(50 * charging.chargeLevel)
                })
            )
        } else {
            // Normal shot (default seed type)
            map.used_power.push(
                new Seed({
                    ...seedConfig,
                    plant: {
                        color: [0],
                        min_growth: 1,
                        max_growth: 5,
                        stem_limit_min: 5,
                        stem_limit_max: 10,
                    }
                })
            )
        }
        
        if (charging.chargeLevel > 0) {
            for (let i = 0; i < Math.floor(5 * charging.chargeLevel); i++) {
                screen.numbers.push(new Number({
                    x: playerCenterX + random(-0.3, 0.3, 0),
                    y: playerCenterY + random(-0.3, 0.3, 0),
                    speed_x: random(-2, 2, 0),
                    speed_y: random(-3, -1, 0),
                    text: charging.chargeLevel >= 1 ? '✦' : '✧',
                    color: charging.chargeLevel >= 1 ? [255, 255, 0, 255] : [255, 255, 255, 200],
                    fade_speed: 4
                }))
            }
        }
        
        if (playerUpgrades.abilities.length > 0 && nextAbilityShot !== Infinity) {
            const shotsUntilNext = nextAbilityShot - this.shot_count
            if (shotsUntilNext > 0 && shotsUntilNext <= 4) { // Only show countdown for 1-4 shots away
                let abilityDisplayName = ''
                if (nextAbilityName === 'homing') abilityDisplayName = 'HOMING'
                else if (nextAbilityName === 'explosive') abilityDisplayName = 'EXPLOSIVE'
                else if (nextAbilityName === 'seedbomb') abilityDisplayName = 'SEED BOMB'
                else if (nextAbilityName === 'cloner') abilityDisplayName = 'CLONER'
                
                const displayText = shotsUntilNext === 1 ? `Next: ${abilityDisplayName}` : `${shotsUntilNext} to ${abilityDisplayName}`
                
                screen.numbers.push(new Number({
                    x: this.x + this.width / 2,
                    y: this.y - 0.3,
                    speed_x: 0,
                    speed_y: -1,
                    text: displayText,
                    color: [255, 255, 255, 255],
                    fade_speed: 3
                }))
            }
        }

        if (charging.ammoConsumed === 0 && this.power > 0) {
            this.power --
        }
    }

    getNextAbilityInfo() {
        if (playerUpgrades.abilities.length === 0) return null
        playerUpgrades.abilities.forEach((ability, index) => {
            if (!(ability in this.abilityCounters)) {
                const numAbilities = playerUpgrades.abilities.length
                const spacing = Math.max(1, Math.floor(5 / numAbilities))
                const offset = Math.floor(5 * (index + 1) / (numAbilities + 1))
                this.abilityCounters[ability] = offset
            }
        })
        
        let nextAbilityShot = Infinity
        let nextAbilityName = ''
        
        for (let ability of playerUpgrades.abilities) {
            if (this.abilityCounters[ability] > this.shot_count && this.abilityCounters[ability] < nextAbilityShot) {
                nextAbilityShot = this.abilityCounters[ability]
                nextAbilityName = ability
            }
        }
        
        if (nextAbilityShot === Infinity) return null
        
        const shotsUntilNext = nextAbilityShot - this.shot_count
        let abilityDisplayName = ''
        if (nextAbilityName === 'homing') abilityDisplayName = 'HOMING'
        else if (nextAbilityName === 'explosive') abilityDisplayName = 'EXPLOSIVE'
        else if (nextAbilityName === 'seedbomb') abilityDisplayName = 'SEED BOMB'
        else if (nextAbilityName === 'cloner') abilityDisplayName = 'CLONER'
        
        return {
            shotsUntilNext: shotsUntilNext,
            abilityName: abilityDisplayName
        }
    }

    dash() {
        if (!playerUpgrades.skills.dash || this.dashCooldown > 0 || this.dashActive) return
        
        this.dashDirection = this.dir.face
        if (this.dir.move !== 0) {
            this.dashDirection = this.dir.move
        }
        
        this.dashActive = true
        this.dashDuration = this.dashMaxDuration
        
        this.dashCooldown = this.dashCooldownMax
        cam.shake = 15
        cam.shift = .008
    }

    update() {
        super.update()

        if (!this.health) {
            this.death('#666')
            return
        }

        if (key.arrowleft || key.a || key.q) {
            this.dir.move = -1
            this.dir.face = -1
        }
        if (key.arrowright || key.d) {
            this.dir.move = 1
            this.dir.face = 1
        }

        if ((
                !key.arrowleft && // left
                !key.arrowright && // right
                !key.a && // left
                !key.q && // left
                !key.d // right
            ) || (
                (key.arrowleft || // left
                key.a || // left
                key.q // left
                ) && (
                key.arrowright || // right
                key.d // right
                )
            )
        ) this.dir.move = 0

        this.collideGround()

        const jumpPressed = key.arrowup || key.w || key.z
        const jumpJustPressed = jumpPressed && !this.prevJumpPressed
        
        if (jumpPressed && this.speed_y >= 0 && this.land_on_side) {
            this.jump(.12)
        }
        else if (jumpJustPressed) {
            if (playerUpgrades.skills.doubleJump) {
                if (!this.in_air) {
                    this.jump(.12)
                    this.jumpCount = 1
                } else if (this.jumpCount === 1) {
                    this.jump(.12)
                    this.jumpCount = 2
                }
            } else {
                if (!this.in_air)
                    this.jump(.12)
            }
        }
        
        if (!this.in_air) {
            this.jumpCount = 0
        }
        
        this.prevJumpPressed = jumpPressed
        
        if (this.dashCooldown > 0) {
            this.dashCooldown--
        }
        
        if (this.dashActive) {
            this.dashDuration--
            
            const dashSpeed = 0.08
            this.x += dashSpeed * this.dashDirection
            
            this.speed_y *= 0.5
            
            this.dashTrail.push({
                x: this.x,
                y: this.y,
                life: 12,
                alpha: 0.8
            })
            
            if (this.dashDuration <= 0) {
                this.dashActive = false
            }
        }
        
        this.dashTrail = this.dashTrail.filter(trail => {
            trail.life--
            trail.alpha = Math.max(0, trail.alpha - 0.08)
            return trail.life > 0
        })
        
        if (this.hit) {
            screen.numbers.push(new Number({
                x: this.x + this.width / 2,
                y: this.y,
                speed_x: 0,
                speed_y: -4,
                text: 'X',
                color: [0, 0, 0, 255],
                fade_speed: 4
            }))

            hero.health --

            if (this.health <= 0) this.jump(.12)

            cam.shake = 30
            cam.shift = .01
            this.recover_time = 50

            this.hit = false
        }

        if (this.recover_time) {
            this.recover_time --
            hero.recover()
        }
        else this.draw()
    }

    draw() {
        this.dashTrail.forEach(trail => {
            ctx.save()
            ctx.globalAlpha = trail.alpha
            ctx.fillStyle = '#88f'
            stretchRect(0, 0, 1, 1, {
                x: trail.x,
                y: trail.y,
                width: this.width * 0.8,
                height: this.height * 0.8
            })
            ctx.restore()
        })
        
        const eye = '#221'
        const face = '#888'
        const arm = '#444'
        const main = '#666'
        const eye_y = .15

        this.body(main, face)
        this.arm(-.5, .6, arm)
        this.arm(.5, .6, arm)

        if (!this.dir.move) {
            this.eye(-.1, eye_y, eye, face)
            this.eye(.1, eye_y, eye, face)
        }
        else {
            if (this.dir.move == -1) {
                this.eye(-.2, eye_y, eye, face)
                this.eye(0, eye_y, eye, face)
            }
            if (this.dir.move == 1) {
                this.eye(0, eye_y, eye, face)
                this.eye(.2, eye_y, eye, face)
            }
        }
        
        if (charging.active || (mouse.worldX !== undefined && mouse.worldY !== undefined)) {
            this.drawTrajectoryPreview()
        }
        
        if (charging.active) {
            this.drawChargeBar()
        }
    }
    
    drawTrajectoryPreview() {
        const playerCenterX = this.x + this.width / 2
        const playerCenterY = this.y + this.height / 2
        
        const deltaX = mouse.worldX - playerCenterX
        const deltaY = mouse.worldY - playerCenterY
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        
        if (distance === 0) return
        
        const chargeMultiplier = 1 + (charging.active ? charging.chargeLevel : 0)
        const baseSpeed = 0.1 * chargeMultiplier
        
        let speed_x = (deltaX / distance) * baseSpeed
        let speed_y = (deltaY / distance) * baseSpeed
        
        const maxSteps = Math.floor(15 + 10 * (charging.active ? charging.chargeLevel : 0)) // Show more path when charged
        const stepSize = 1.0 // Time step for simulation
        
        let simX = playerCenterX
        let simY = playerCenterY
        let simSpeedX = speed_x
        let simSpeedY = speed_y
        
        const trajectoryPoints = []
        
        for (let step = 0; step < maxSteps; step++) {
            simSpeedY += gravity * stepSize
            simSpeedX *= 0.97 // Air resistance
            
            simX += simSpeedX * stepSize
            simY += simSpeedY * stepSize
            
            if (simX < 0 || simX > map.width) break
            
            const groundHeight = map.array[Math.floor(simX)]
            if (groundHeight && simY >= -groundHeight) {
                // Add final point at ground level
                trajectoryPoints.push({
                    x: simX,
                    y: -groundHeight,
                    isEnd: true
                })
                break
            }
            
            trajectoryPoints.push({
                x: simX,
                y: simY,
                isEnd: false
            })
        }
        
        ctx.save()
        for (let i = 0; i < trajectoryPoints.length; i++) {
            const point = trajectoryPoints[i]
            const alpha = 1 - (i / trajectoryPoints.length) * 0.7 
            
            if (point.isEnd) {
                ctx.fillStyle = charging.active && charging.chargeLevel >= 1 ? 
                    `rgba(255, 255, 0, ${alpha})` : `rgba(255, 100, 100, ${alpha})`
                const size = 0.08
                stretchRect(
                    point.x - size/2, 
                    point.y - size/2, 
                    size, 
                    size, 
                    { x: 0, y: 0, width: 1, height: 1 }
                )
            } else {
                ctx.fillStyle = charging.active && charging.chargeLevel >= 1 ? 
                    `rgba(255, 255, 0, ${alpha})` : `rgba(255, 255, 255, ${alpha})`
                const size = 0.04
                stretchRect(
                    point.x - size/2, 
                    point.y - size/2, 
                    size, 
                    size, 
                    { x: 0, y: 0, width: 1, height: 1 }
                )
            }
        }
        ctx.restore()
    }
    
    drawChargeBar() {
        const barWidth = 0.4
        const barHeight = 0.06
        const barX = this.x + this.width / 2 - barWidth / 2
        const barY = this.y - 0.15
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
        stretchRect(barX, barY, barWidth, barHeight, { x: 0, y: 0, width: 1, height: 1 })
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.lineWidth = 2
        ctx.strokeRect(
            (barX * scale) - cam.offset_x,
            (barY * scale) - cam.offset_y,
            barWidth * scale,
            barHeight * scale
        )
        
        const fillWidth = barWidth * charging.chargeLevel
        if (fillWidth > 0) {
            let fillColor
            if (charging.chargeLevel >= 1) {
                fillColor = 'rgba(255, 255, 0, 0.9)' // Gold for max charge
            } else if (charging.chargeLevel >= 0.66) {
                fillColor = 'rgba(255, 150, 0, 0.9)' // Orange for high charge
            } else if (charging.chargeLevel >= 0.33) {
                fillColor = 'rgba(255, 100, 0, 0.9)' // Red-orange for medium charge
            } else {
                fillColor = 'rgba(255, 255, 255, 0.9)' // White for low charge
            }
            
            ctx.fillStyle = fillColor
            stretchRect(barX, barY, fillWidth, barHeight, { x: 0, y: 0, width: 1, height: 1 })
        }
        
        for (let i = 1; i < 3; i++) {
            const segmentX = barX + (barWidth * i / 3)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo((segmentX * scale) - cam.offset_x, (barY * scale) - cam.offset_y)
            ctx.lineTo((segmentX * scale) - cam.offset_x, ((barY + barHeight) * scale) - cam.offset_y)
            ctx.stroke()
        }
        
        if (charging.ammoConsumed > 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
            ctx.font = Math.max(12, (cvs.width + cvs.height) / 120) + 'px "Courier New", monospace'
            ctx.textAlign = 'center'
            const textX = (this.x + this.width / 2) * scale - cam.offset_x
            const textY = (barY - 0.02) * scale - cam.offset_y
            ctx.fillText(`-${charging.ammoConsumed} ENERGY`, textX, textY)
        }
        
        if (charging.active && hero.power <= 0) {
            ctx.fillStyle = 'rgba(255, 50, 50, 1.0)' 
            ctx.font = Math.max(12, (cvs.width + cvs.height) / 120) + 'px "Courier New", monospace'
            ctx.textAlign = 'center'
            const textX = (this.x + this.width / 2) * scale - cam.offset_x
            const textY = (barY + barHeight + 0.06) * scale - cam.offset_y
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)'
            ctx.lineWidth = 3
            ctx.strokeText('OUT OF ENERGY!', textX, textY)
            ctx.fillText('OUT OF ENERGY!', textX, textY)
        }
    }
}

class Enemy extends Robot {
    constructor (x, y, width, height) {
        super(x, y, width, height)

        this.seed_health_loss = .15
        this.plant_health_loss = .003
        this.full_bonus = 5

        this.health = 1
        this.bonus = 0
        this.move_time = 100
        this.speed = .03
        this.clone_timer = 0
    }

    kill() {
        this.death('#433')

        const jump_time = 10000

        if (this.health > -jump_time) {
            this.jump(.12)
            this.health -= jump_time * 2
            if (this.bonus <= 0) this.bonus = 0

            map.checkIfAllEnemiesAreDead()
            for (let i = 0; i < random(2, 5); i ++) {
                const x = random(0, this.width, 0)
                map.plants.push(
                    new Plant({
                        x: this.x + x,
                        y: -map.array[Math.floor(this.x + x)],
                        color: [random(100, 255), random(0, 20), random(0, 20), 255],
                        min_growth: 1,
                        max_growth: 2,
                        stem_limit_min: 2,
                        stem_limit_max: 5
                    })
                )
            }

            screen.numbers.push(new Number({
                x: this.x,
                y: this.y,
                speed_x: 0,
                speed_y: -2,
                text: '+2',
                color: [0, 255, 0, 255],
                fade_speed: 2
            }))

            if (Math.ceil(this.bonus) >= this.full_bonus) {
                screen.numbers.push(new Number({
                    x: cvs.width / 2,
                    y: cvs.height / 2,
                    speed_x: 0,
                    speed_y: -1,
                    text: '+' + this.full_bonus + '! You destroyed a robot entirely using plants!',
                    color: [0, 255, 200, 255],
                    fade_speed: 1
                }, false))

                hero.power += this.full_bonus
            }
            else {
                if (this.bonus) {
                    screen.numbers.push(new Number({
                        x: cvs.width / 2,
                        y: cvs.height / 2,
                        speed_x: 0,
                        speed_y: -1,
                        text: 'PLANT BONUS: ' + Math.ceil(this.bonus),
                        color: [0, 255, 200, 255],
                        fade_speed: 2
                    }, false))
                }

                hero.power += this.bonus
            }

            hero.power += 2
        }
    }

    update() {
        if (!this.onScreen()) return

        super.update()

        if (this.health <= 0) {
            this.kill()

            return
        }

        // control
        if (!this.land_on_side) {
            this.move_time --
            if (this.move_time < 0) {
                const dir = random(1, 3)

                if (this.dir.move) this.dir.move = 0

                else {
                    if (dir == 1) {
                        this.dir.move = -1
                        this.dir.face = -1
                    }
                    else if (dir == 2) {
                        this.dir.move = 1
                        this.dir.face = 1
                    }
                }

                this.move_time = random(100, 200)
            }
        }

        this.collideGround()
        if (collide(this, hero) && !hero.recover_time) hero.hit = true

        map.used_power.forEach(item => {
            if (collide(this, item)) {
                if (this.health > 0) {
                    // Use the item's damage if it exists, otherwise fall back to default seed damage
                    const itemDamage = (item.damage !== undefined) ? item.damage : this.seed_health_loss
                    
                    if (item.constructor.name === 'ExplosiveSeed') {
                        this.health -= itemDamage  // ExplosiveSeed already has 3x damage multiplier built in
                        // Create explosion animation
                        map.explosions.push(new Explosion(this.x + this.width/2, this.y + this.height/2))
                        const knockbackForce = 0.3 
                        const direction = item.speed_x > 0 ? 1 : -1
                        this.speed_x = direction * knockbackForce
                        this.speed_y = -knockbackForce * 1.2  // Strong upward knockback
                        this.jump(0.25)  
                        this.in_air = true  
                    }
                    else if (item.constructor.name === 'HomingSeed') {
                        this.health -= itemDamage
                        item.createHitEffect(this.x + this.width/2, this.y + this.height/2)
                    } else {
                        this.health -= itemDamage
                    }
                }

                cam.shake = 10
                cam.shift = .005

                map.used_power.splice(map.used_power.indexOf(item), 1)
            }
        })
        map.plant_screen.forEach(item => {
            if (collide(this, item)) {
                this.health -= this.plant_health_loss
                this.bonus += this.full_bonus * this.plant_health_loss

                cam.shake = 10
                cam.shift = .001
            }
        })

        if (this.land_on_side && this.speed_y >= 0) this.jump(.08)

        if (!map.junk.length && hero.power < 1) {
            map.junk.push(
                new Junk(
                    this.x, this.y
                )
            )
        }

        this.draw()
    }

    draw() {
        const face = '#966'
        const eye = '#f00'
        const arm = '#322'
        const main = '#433'
        const eye_y = .15

        this.body(main, face)
        this.arm(-.5, .6, arm)
        this.arm(.5, .6, arm)

        if (!this.dir.move) {
            this.eye(-.2, eye_y, eye, face)
            this.eye(.2, eye_y, eye, face)
        }
        else {
            if (this.dir.move == -1) {
                this.eye(-.3, eye_y, eye, face)
                this.eye(.1, eye_y, eye, face)
            }
            if (this.dir.move == 1) {
                this.eye(-.1, eye_y, eye, face)
                this.eye(.3, eye_y, eye, face)
            }
        }

        ctx.fillStyle = '#000'
        stretchRect(0, -.3, this.health, .05, this)
    }
}

class Clone extends Robot {
    constructor (x, y, width, height) {
        super(x, y, width, height)

        this.move_time = 0
        this.speed = .015
        this.y -= this.height
        this.speed_y = -random(.05, .1, 0)

        this.dead = false
        this.drop_seed_timer = 100
    }

    update() {
        if (!this.onScreen()) return
        super.update()

        // control
        if (!this.land_on_side) {
            this.move_time --
            if (this.move_time < 0) {
                const dir = random(1, 3)

                if (this.dir.move) this.dir.move = 0

                else {
                    if (dir == 1) {
                        this.dir.move = -1
                        this.dir.face = -1
                    }
                    else if (dir == 2) {
                        this.dir.move = 1
                        this.dir.face = 1
                    }
                }

                this.move_time = random(100, 200)
            }
        }

        this.collideGround()
        if (this.land_on_side && this.speed_y >= 0) this.jump(.12)

        this.drop_seed_timer --

        if (this.drop_seed_timer <= 0 && this.dir.move) {
            map.used_power.push(
                new Seed({
                    x: this.x + this.width / 2,
                    y: this.y + this.height / 2,
                    width: .05,
                    height: .05,
                    speed_x: .05 * this.dir.face,
                    speed_y: -.03,
                    life_time: 60,

                    plant: {
                        color: [0, random(0, 255), 0, 255],
                        min_growth: 1,
                        max_growth: 3,
                        stem_limit_min: 5,
                        stem_limit_max: 10
                    }
                })
            )

            this.drop_seed_timer = 100
        }

        this.draw()
    }

    draw() {
        const face = '#696'
        const eye = '#000'
        const arm = '#232'
        const main = '#343'
        const eye_y = .15

        this.body(main, face)
        this.arm(-.5, .6, arm)
        this.arm(.5, .6, arm)

        if (!this.dir.move) {
            this.eye(-.1, eye_y, eye, face)
            this.eye(.1, eye_y, eye, face)
        }
        else {
            if (this.dir.move == -1) {
                this.eye(-.2, eye_y, eye, face)
                this.eye(0, eye_y, eye, face)
            }
            if (this.dir.move == 1) {
                this.eye(0, eye_y, eye, face)
                this.eye(.2, eye_y, eye, face)
            }
        }
    }
}
