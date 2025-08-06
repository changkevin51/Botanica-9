
class Junk extends Base {
    constructor (x, y) {
        super()

        this.x = x
        this.y = y

        this.speed_y = 0
        this.time = random(0, 100, 0)

        const type = random(0, 150)
        if (type <= 50) this.type = 'bottle'
        else if (type <= 70) this.type = 'machine'
        else if (type <= 100) this.type = 'packet'
        else if (type <= 150) this.type = 'box'

        const angle = random(0, 100)
        let set_angle = ''
        if (angle <= 30) set_angle = 'left'
        else if (angle <= 70) set_angle = 'up'
        else if (angle <= 100) set_angle = 'right'

        if (this.type == 'bottle') {
            this.width = .1
            this.height = .2

            this.angle =
                set_angle == 'left' ? random(-80, -70, 0)
                : set_angle == 'up' ? random(-10, 10, 0)
                : set_angle == 'right' ? random(70, 80, 0) : 0
        }
        else if (this.type == 'machine') {
            this.width = .3
            this.height = .3

            this.angle = random(-5, 5, 0)
        }
        else if (this.type == 'packet') {
            this.width = .12
            this.height = .15

            this.angle =
                set_angle == 'left' ? random(-80, -70, 0)
                : set_angle == 'up' ? random(-20, 20, 0)
                : set_angle == 'right' ? random(70, 80, 0) : 0
        }
        else if (this.type == 'box') {
            this.width = .25
            this.height = .25

            this.angle = random(-2, 2)
        }

        this.y = -map.array[Math.floor(this.x)] - this.height
    }

    update() {
        if (!this.onScreen()) return

        this.y += this.speed_y
        this.speed_y += gravity

        const arr = [{
            x: Math.floor(this.x + this.width),
            y: -map.array[Math.floor(this.x + this.width)],
            width: 1, height: map.array[Math.floor(this.x + this.width)]
        },{
            x: Math.floor(this.x),
            y: -map.array[Math.floor(this.x)],
            width: 1, height: map.array[Math.floor(this.x)]
        }]

        arr.forEach(obj => {
            if (collide(this, obj)) {
                const overlap = merge(this, obj)

                if (overlap.x) this.x -= overlap.x
                else {
                    this.y -= overlap.y
                    this.speed_y = 0
                    this.in_air = false
                }
            }
        })

        if (collide(hero, this)) {
            map.junk.splice(map.junk.indexOf(this), 1)

            screen.numbers.push(new Number({
                x: this.x,
                y: this.y,
                speed_x: 0,
                speed_y: -5,
                text: '+1',
                color: [0],
                fade_speed: 10
            }))

            hero.power += 1
        }

        this.draw()
    }

    draw() {
        this.time += .1
        if (this.type == 'bottle') {
            const anchor_x = .5
            const anchor_y = 1

            ctx.save()
                translate(anchor_x, anchor_y, this)
                rotate(this.angle)

                // main bottle
                ctx.fillStyle = '#7309'
                scaleRect(.25, 0, .5, 1, this, anchor_x, anchor_y)
                scaleRect(0, .4, 1, .6, this, anchor_x, anchor_y)
                // reflection
                ctx.fillStyle = '#fff5'
                scaleRect(.3, .4, .1, .6, this, anchor_x, anchor_y)
                scaleRect(.4, 0, .07, .4, this, anchor_x, anchor_y)
                // lid
                ctx.fillStyle = '#4009'
                scaleRect(.2, 0, .6, .05, this, anchor_x, anchor_y)
                scaleRect(.2, .09, .6, .05, this, anchor_x, anchor_y)
                ctx.fillStyle = '#9729'
                scaleRect(.25, -.03, .5, .05, this, anchor_x, anchor_y)
            ctx.restore()
        }
        else if (this.type == 'machine') {
            const anchor_x = .5
            const anchor_y = .5

            ctx.save()
                translate(
                    anchor_x + random(-.02, .02, 0),
                    anchor_y + random(-.04, .04, 0), this
                )
                rotate(this.angle)
                // main washing machine
                // const offset_x = 
                // const offset_y = 

                ctx.fillStyle = '#a98'
                scaleRect(
                    0, 0, 1, 1, this,
                    anchor_x, anchor_y
                )
                // lights
                for (let i = 0; i < 5; i ++) {
                    if (~~this.time % (i + 2) == 0) {
                        ctx.fillStyle = rgb(
                            random(0, 255),
                            random(0, 50),
                            random(0, 100)
                        )
                        scaleRect(
                            .05 + i * .2, .05, .05, .1, this,
                            anchor_x, anchor_y
                        )
                    }
                }
                // spinning bit
                ctx.fillStyle = '#111b'
                scaleCir(
                    .5 + random(-.01, .01, 0),
                    .5 + random(-.01, .01, 0),
                    .35, this, anchor_x, anchor_y
                )
                // reflection
                ctx.fillStyle = '#fff5'
                scaleRect(
                    .475 + Math.sin(this.time * 2) * .25,
                    .475 + Math.cos(this.time * 2) * .25,
                    .05, .05, this, anchor_x, anchor_y
                )
            ctx.restore()
        }
        else if (this.type == 'packet') {
            const anchor_x = .5
            const anchor_y = 1

            ctx.save()
                translate(anchor_x, anchor_y, this)
                rotate(this.angle)
                // main packaging
                ctx.fillStyle = '#811'
                scaleRect(0, 0, 1, 1, this, anchor_x, anchor_y)
                // The 'M'
                ctx.fillStyle = '#990'
                scaleRect(.2, .2, .1, .6, this, anchor_x, anchor_y)
                scaleRect(.3, .3, .1, .2, this, anchor_x, anchor_y)
                scaleRect(.4, .4, .1, .2, this, anchor_x, anchor_y)
                scaleRect(.5, .3, .1, .2, this, anchor_x, anchor_y)
                scaleRect(.6, .2, .1, .6, this, anchor_x, anchor_y)
                // red top
                ctx.fillStyle = '#a98'
                scaleRect(-.05, 0, 1.1, .1, this, anchor_x, anchor_y)
                // lower text
                ctx.fillStyle = '#4446'
                scaleRect(.45, .9, .5, .05, this, anchor_x, anchor_y)
            ctx.restore()

        }
        else if (this.type == 'box') {
            const anchor_x = .5
            const anchor_y = .5

            ctx.save()
                translate(anchor_x, anchor_y, this)
                rotate(this.angle)
                // main box bit
                ctx.fillStyle = '#752'
                scaleRect(
                    0, 0, 1, 1, this,
                    anchor_x, anchor_y
                )
                // side
                ctx.fillStyle = '#0003'
                scaleRect(
                    .9, 0, .1, 1, this,
                    anchor_x, anchor_y
                )
                // tape
                ctx.fillStyle = '#0002'
                scaleRect(
                    0, .4, 1, .2, this,
                    anchor_x, anchor_y
                )
                scaleRect(
                    .6, 0, .2, .1, this,
                    anchor_x, anchor_y
                )
                // text
                ctx.fillStyle = '#0003'
                scaleRect(
                    .05, .05, .2, .05, this,
                    anchor_x, anchor_y
                )
                scaleRect(
                    .05, .11, .12, .05, this,
                    anchor_x, anchor_y
                )
                scaleRect(
                    .05, .17, .21, .05, this,
                    anchor_x, anchor_y
                )
                ctx.fillStyle = '#b009'
                scaleRect(
                    .05, .23, .23, .05, this,
                    anchor_x, anchor_y
                )
            ctx.restore()
        }

        for (let i = 0; i < 5; i ++) {
            ctx.fillStyle = '#0002'
            stretchRect(
                (i % 1.2) - .2, 1, .5,
                -.1 + Math.sin(
                    (this.time / 2 + (i ^ 9))
                ) / 20, this
            )
        }
    }
}

class Upgrade extends Base {
    constructor(d) {
        super()
        this.x = d.x
        this.y = d.y
        this.width = d.width
        this.height = d.height

        this.speed_x = d.speed_x
        this.speed_y = d.speed_y
        this.life_time = d.life_time

        this.in_air = true
    }
    update() {
        this.life_time --
        // collision
        let collision = false
        const arr = [{
            x: Math.floor(this.x + this.width),
            y: -map.array[Math.floor(this.x + this.width)],
            width: 1, height: map.array[Math.floor(this.x + this.width)]
        },{
            x: Math.floor(this.x),
            y: -map.array[Math.floor(this.x)],
            width: 1, height: map.array[Math.floor(this.x)]
        }]
        arr.forEach(obj => {
            if (collide(this, obj)) {
                collision = true
                const overlap = merge(this, obj)

                if (overlap.x) {
                    this.speed_x -= overlap.x

                    this.speed_x *= .6
                }
                else {
                    this.in_air = false
                    this.speed_y -= overlap.y

                    this.speed_x *= .9
                    this.speed_y *= .85
                }
            }
        })
        if (!collision) this.in_air = true

        if (this.x < 0) {
            this.speed_x -= this.x
            if (this.y > -map.array[0]) {
                this.y = -map.array[0] - this.height
                this.speed_y = 0
            }
        }
        if (this.x + this.width > map.width) {
            this.speed_x += map.width - (this.x + this.width)
            if (this.y > -map.array[map.width - 1]) {
                this.y = -map.array[map.width - 1] - this.height
                this.speed_y = 0
            }
        }

        this.y += this.speed_y
        this.speed_y += gravity
        this.x += this.speed_x
        this.speed_x *= .97

        if (this.speed_y > .5) this.speed_y = .5


        const y1 = map.array[Math.floor(this.x)]
        const y2 = map.array[Math.floor(this.x + 1)]
        const h1 = this.y > -y1
        const h2 = this.y > -y2

        if (h1 && h2) {
            const dir = y1 < y2 ? 1 : -1
            this.x -= dir * this.width

            h1 > h2 ? this.y = h1 - this.height : h1 - this.height

            this.speed_x = dir * random(.01, .02, 0)
            this.speed_y = -random(.01, .02, 0)
        }
    }
}

class Seed extends Upgrade {
    constructor(d) {
        super(d)

        this.plant = d.plant
    }

    update() {
        super.update()

        if (this.life_time < 0) {
            map.plantsOnScreen()
            map.plants.push(
                new Plant({
                    x: this.x + this.width / 2,
                    y: -map.array[Math.floor(this.x + this.width / 2)],
                    color: this.plant.color,
                    min_growth: this.plant.min_growth,
                    max_growth: this.plant.max_growth,
                    stem_limit_min: this.plant.stem_limit_min,
                    stem_limit_max: this.plant.stem_limit_max
                })
            )
            map.used_power.splice(map.used_power.indexOf(this), 1)
        }

        this.draw()
    }

    draw() {
        ctx.save()
        translate(.5, .5, this)
        rotate(this.speed_x * this.speed_y * 1e4)
        ctx.fillStyle = '#652'
        scaleRect(0, 0, 1, 1, this, .5, .5)
        ctx.restore()
    }
}

class SeedBomb extends Upgrade {
    constructor(d) {
        super(d)

        this.plant = d.plant
    }
    update() {
        super.update()

        const explode_amount = 30

        if (this.life_time < 0) {
            for (let i = 0; i < explode_amount; i ++) {
                map.used_power.push(
                    new Seed({
                        x: this.x + this.width / 2,
                        y: this.y + this.height / 2,
                        width: .06,
                        height: .06,
                        speed_x: random(-.2, .2, 0),
                        speed_y: -random(0, .3, 0),
                        life_time: 100,

                        plant: {
                            color: this.plant.color,
                            min_growth: this.plant.min_growth,
                            max_growth: this.plant.max_growth,
                            stem_limit_min: this.plant.stem_limit_min,
                            stem_limit_max: this.plant.stem_limit_max
                        }
                    })
                )
            }
            map.used_power.splice(map.used_power.indexOf(this), 1)
        }

        this.draw()
    }

    draw() {
        ctx.save()
        translate(.5, .5, this)
        rotate(this.speed_x * this.speed_y * 1e4)
        ctx.fillStyle = '#113'
        scaleRect(0, 0, 1, 1, this, .5, .5)
        ctx.restore()
    }
}

class Cloner extends Upgrade {
    constructor(d) {
        super(d)
    }
    update() {
        super.update()

        if (this.life_time < 0) {
            map.clones.push(
                new Clone(
                    this.x + this.width / 2,
                    -map.array[Math.floor(this.x + this.width / 2)],
                    .2, .2
                )
            )
            map.used_power.splice(map.used_power.indexOf(this), 1)
        }

        this.draw()
    }

    draw() {
        ctx.save()
        translate(.5, .5, this)
        rotate(this.speed_x * this.speed_y * 1e4)
        ctx.fillStyle = '#0f0'
        scaleRect(0, 0, 1, 1, this, .5, .5)
        ctx.restore()
    }
}

class HomingSeed extends Upgrade {
    constructor(d) {
        super(d)
        
        this.homing_speed = 0.008  // More aggressive homing
        this.target = null
        this.hit_effect_timer = 0
        this.hit_effect_active = false
        
        // Override the inherited speeds to make it slower initially
        this.speed_x *= 0.3  // Make initial speed much slower
        this.speed_y *= 0.3
        this.max_speed = 0.08  // Higher max speed for better homing
    }

    findNearestEnemy() {
        let nearest = null
        let nearestDistance = Infinity
        
        map.enemies.forEach(enemy => {
            if (enemy.health > 0) {
                const dx = enemy.x + enemy.width/2 - (this.x + this.width/2)
                const dy = enemy.y + enemy.height/2 - (this.y + this.height/2)
                const distance = Math.sqrt(dx * dx + dy * dy)
                
                if (distance < nearestDistance) {
                    nearest = enemy
                    nearestDistance = distance
                }
            }
        })
        
        // Also check clones (they don't have health property, so just check if they exist)
        map.clones.forEach(clone => {
            const dx = clone.x + clone.width/2 - (this.x + this.width/2)
            const dy = clone.y + clone.height/2 - (this.y + this.height/2)
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            if (distance < nearestDistance) {
                nearest = clone
                nearestDistance = distance
            }
        })
        
        return nearest
    }

    createHitEffect(x, y) {
        // Create white particles for hit effect
        for (let i = 0; i < 8; i++) {
            screen.numbers.push(new Number({
                x: x,
                y: y,
                speed_x: random(-3, 3, 0),
                speed_y: random(-3, 0, 0),
                text: '•',
                color: [255, 255, 255, 255],
                fade_speed: 8
            }))
        }
    }

    update() {
        // Don't call super.update() - we'll handle physics ourselves for better control
        this.life_time --

        if (this.life_time < 0) {
            map.used_power.splice(map.used_power.indexOf(this), 1)
            return
        }

        // Find target if we don't have one or if current target is dead
        if (!this.target || (this.target.health !== undefined && this.target.health <= 0)) {
            this.target = this.findNearestEnemy()
        }

        // Home towards target if we have one
        if (this.target && (this.target.health === undefined || this.target.health > 0)) {
            const dx = this.target.x + this.target.width/2 - (this.x + this.width/2)
            const dy = this.target.y + this.target.height/2 - (this.y + this.height/2)
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            if (distance > 0) {
                // More aggressive homing - adjust velocity toward target
                this.speed_x += (dx / distance) * this.homing_speed
                this.speed_y += (dy / distance) * this.homing_speed
                
                // Cap the speed so it doesn't get too fast
                const currentSpeed = Math.sqrt(this.speed_x * this.speed_x + this.speed_y * this.speed_y)
                if (currentSpeed > this.max_speed) {
                    this.speed_x = (this.speed_x / currentSpeed) * this.max_speed
                    this.speed_y = (this.speed_y / currentSpeed) * this.max_speed
                }
            }
        }

        // Apply much less gravity so it can curve upward toward targets
        this.speed_y += gravity * 0.1

        // Update position
        this.x += this.speed_x
        this.y += this.speed_y

        // Apply minimal air resistance to maintain momentum
        this.speed_x *= 0.995
        this.speed_y *= 0.995

        // Only remove if we're way out of bounds (no wall collision)
        if (this.x < -5 || this.x > map.width + 5 || this.y > 20) {
            map.used_power.splice(map.used_power.indexOf(this), 1)
            return
        }

        this.draw()
    }

    draw() {
        ctx.save()
        translate(.5, .5, this)
        rotate(this.speed_x * this.speed_y * 1e4)
        ctx.fillStyle = '#fff'  // White color for homing seed
        scaleRect(0, 0, 1, 1, this, .5, .5)
        
        // Add a slight glow effect
        ctx.shadowColor = '#fff'
        ctx.shadowBlur = 10
        scaleRect(0, 0, 1, 1, this, .5, .5)
        
        ctx.restore()
    }
}

class ExplosiveSeed extends Upgrade {
    constructor(d) {
        super(d)
        
        this.explosive = true
    }

    update() {
        super.update()

        if (this.life_time < 0) {
            // Create explosion effect
            map.explosions.push(new Explosion(this.x + this.width/2, this.y + this.height/2))
            map.used_power.splice(map.used_power.indexOf(this), 1)
        }

        this.draw()
    }

    draw() {
        ctx.save()
        translate(.5, .5, this)
        rotate(this.speed_x * this.speed_y * 1e4)
        ctx.fillStyle = '#f80'  // Orange color for explosive seed
        scaleRect(0, 0, 1, 1, this, .5, .5)
        
        // Add a pulsing glow effect
        ctx.shadowColor = '#f80'
        ctx.shadowBlur = 15
        scaleRect(0, 0, 1, 1, this, .5, .5)
        
        ctx.restore()
    }
}

class Explosion extends Base {
    constructor(x, y) {
        super()
        
        this.x = x - 0.5
        this.y = y - 0.5
        this.width = 1
        this.height = 1
        
        this.frame = 0
        this.frameSpeed = 3
        this.frameCounter = 0
        this.maxFrames = 6
        
        this.finished = false
        
        // Load explosion frames
        this.frames = []
        for (let i = 0; i < this.maxFrames; i++) {
            const img = new Image()
            img.src = `explosion/tile00${i}.png`
            this.frames.push(img)
        }
    }
    
    update() {
        if (this.finished) return
        
        this.frameCounter++
        if (this.frameCounter >= this.frameSpeed) {
            this.frameCounter = 0
            this.frame++
            
            if (this.frame >= this.maxFrames) {
                this.finished = true
                // Remove from explosions array
                const index = map.explosions.indexOf(this)
                if (index > -1) {
                    map.explosions.splice(index, 1)
                }
            }
        }
        
        this.draw()
    }
    
    draw() {
        if (this.finished || this.frame >= this.maxFrames) return
        
        const currentFrame = this.frames[this.frame]
        if (currentFrame && currentFrame.complete) {
            ctx.drawImage(
                currentFrame,
                (this.x) * scale - cam.offset_x,
                (this.y) * scale - cam.offset_y,
                this.width * scale,
                this.height * scale
            )
        }
    }
}
