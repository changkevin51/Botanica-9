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
        this.health = 5
        this.power = 0
        this.shot_count = 0

        this.x = .35
        this.y = -10
    }

    recover() {
        Math.floor(this.recover_time / 10) % 2 ? this.draw() : 0
    }

    throw() {
        this.shot_count++
        
        // Every 5th shot is a special homing seed
        if (this.shot_count % 5 === 0) {
            map.used_power.push(
                new HomingSeed({
                    x: this.x + this.width / 2,
                    y: this.y + this.height / 2,
                    width: .08,
                    height: .08,
                    speed_x: .08 * this.dir.face,
                    speed_y: -.04,
                    life_time: 300
                })
            )
        }
        // Every 5th shot starting from 2nd shot (2, 7, 12, 17...) is explosive
        else if ((this.shot_count - 2) % 5 === 0 && this.shot_count >= 2) {
            map.used_power.push(
                new ExplosiveSeed({
                    x: this.x + this.width / 2,
                    y: this.y + this.height / 2,
                    width: .09,
                    height: .09,
                    speed_x: .1 * this.dir.face + random(-.01, .01, 0),
                    speed_y: -.05,
                    life_time: 120
                })
            )
        } else {
            // Normal shots
            if (this.upgrade == 'seed') {
                map.used_power.push(
                    new Seed({
                        x: this.x + this.width / 2,
                        y: this.y + this.height / 2,
                        width: .1,
                        height: .1,
                        speed_x: .1 * this.dir.face + random(-.01, .01, 0),
                        speed_y: -.05,
                        life_time: 100,

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
            else if (this.upgrade == 'seed bomb') {
                map.used_power.push(
                    new SeedBomb({
                        x: this.x + this.width / 2,
                        y: this.y + this.height / 2,
                        width: .1,
                        height: .1,
                        speed_x: .1 * this.dir.face + random(-.01, .01, 0),
                        speed_y: -.05,
                        life_time: 200,

                        plant: {
                            color: [0],
                            min_growth: 1,
                            max_growth: 5,
                            stem_limit_min: 5,
                            stem_limit_max: 10
                        }
                    })
                )
            }
            else if (this.upgrade == 'cloner') {
                map.used_power.push(
                    new Cloner({
                        x: this.x + this.width / 2,
                        y: this.y + this.height / 2,
                        width: .1,
                        height: .1,
                        speed_x: .1 * this.dir.face + random(-.01, .01, 0),
                        speed_y: -.05,
                        life_time: 100
                    })
                )
            }
        }

        this.power --
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

        /* if you're not pressing left orright
        OR you're pressing both left and right,
        stop moving the player */

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

        if (key.arrowup || key.w || key.z)
            if (!this.in_air || this.speed_y >= 0 && this.land_on_side)
                this.jump(.12)
        
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
                    // Explosive seeds deal triple damage and knockback
                    if (item.constructor.name === 'ExplosiveSeed') {
                        this.health -= this.seed_health_loss * 3
                        // Create explosion animation
                        map.explosions.push(new Explosion(this.x + this.width/2, this.y + this.height/2))
                        // Massive knockback effect - send them flying!
                        const knockbackForce = 0.5  // Much stronger knockback
                        const direction = item.speed_x > 0 ? 1 : -1
                        this.speed_x = direction * knockbackForce
                        this.speed_y = -knockbackForce * 1.2  // Strong upward knockback
                        this.jump(0.25)  // Additional jump force
                        this.in_air = true  // Ensure they're airborne
                    }
                    // Homing seeds deal double damage
                    else if (item.constructor.name === 'HomingSeed') {
                        this.health -= this.seed_health_loss * 2
                        // Create hit effect
                        item.createHitEffect(this.x + this.width/2, this.y + this.height/2)
                    } else {
                        this.health -= this.seed_health_loss
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
