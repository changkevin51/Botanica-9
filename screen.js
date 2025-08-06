// Screen management and UI elements

class Screen {
    constructor() {
        this.set()
    }

    set() {
        this.numbers = []

        this.sun = {
            r: 255,
            g: 68,
            b: 0
        }
        this.sky = {
            r: 0,
            g: 0,
            b: 0
        }
        this.mist = {
            r: 0,
            g: 0,
            b: 0,
            a: 255
        }
        this.fade = {
            r: 0,
            g: 0,
            b: 0,
            a: 0,
            type: 'in'
        }

        this.time = 0
    }

    background() {
        const gradient = ctx.createRadialGradient(
            cvs.width / 2, cvs.height / 2, cvs.height / 3,
            cvs.width / 2, cvs.height / 2, cvs.width / 1.5
        )
        gradient.addColorStop(0, rgb(
            this.sun.r,
            this.sun.g,
            this.sun.b
        ))
        gradient.addColorStop(1, rgb(
            this.sky.r,
            this.sky.g,
            this.sky.b
        ))
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, cvs.width, cvs.height)
    }

    foreground() {
        this.time += .1

        const gradient = ctx.createRadialGradient(
            cvs.width / 2, cvs.height / 2, cvs.height / 3,
            cvs.width / 2, cvs.height / 2, cvs.width / 1.5
        )
        gradient.addColorStop(0, '#0000')
        gradient.addColorStop(1, rgb(
            this.mist.r,
            this.mist.g,
            this.mist.b,
            this.mist.a
        ))
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, cvs.width, cvs.height)

        ctx.fillStyle = '#fff'

        // health
            let size = (cvs.width + cvs.height) / 50
            if (size < 20) size = 20

            ctx.textAlign = 'center'
            ctx.font = size + 'px "Courier New", monospace'
            let str = ''
            for (let i = 0; i < hero.health; i ++) str += '♥'
            ctx.fillText(str, cvs.width / 2, size + Math.sin(this.time))

        // details
            size = (cvs.width + cvs.height) / 80
            if (size < 20) size = 20

            ctx.textAlign = 'left'
            ctx.font = size + 'px "Courier New", monospace'
            ctx.fillText(
                'UPGRADE: ' + hero.upgrade.toUpperCase() +
                ' (SPACE TO THROW)', 5, size
            )
            ctx.fillText(
                'POWER: '
                + ~~hero.power + ' / ' + hero.max_power, 5, size * 2
            )
            
            // Show homing seed counter
            const shotsUntilHoming = 5 - (hero.shot_count % 5)
            const isHomingReady = (hero.shot_count % 5 === 4) // Next shot will be homing
            const homingText = isHomingReady ? 'NEXT: HOMING SEED!' : 'HOMING IN: ' + shotsUntilHoming
            ctx.fillStyle = isHomingReady ? '#0f0' : '#aaa'
            ctx.fillText(homingText, 5, size * 3)
            
            // Show explosive seed counter
            const shotsUntilExplosive = hero.shot_count >= 2 ? 5 - ((hero.shot_count - 2) % 5) : 2 - hero.shot_count
            const isExplosiveReady = hero.shot_count >= 2 && (hero.shot_count - 2) % 5 === 4
            const explosiveText = hero.shot_count < 2 ? 'EXPLOSIVE IN: ' + (2 - hero.shot_count) : 
                                  isExplosiveReady ? 'NEXT: EXPLOSIVE!' : 'EXPLOSIVE IN: ' + shotsUntilExplosive
            ctx.fillStyle = isExplosiveReady ? '#f80' : '#aaa'
            ctx.fillText(explosiveText, 5, size * 4)
            
            // Show difficulty mode indicator
            ctx.fillStyle = gameDifficulty === 'easy' ? '#0f0' : '#f00'
            ctx.fillText('MODE: ' + gameDifficulty.toUpperCase(), 5, size * 5)
            
            ctx.fillStyle = '#fff' // Reset color

        // numbers
            this.numbers.forEach(item => {
                item.update()
            })
    }

    fadeOut() {
        if (this.fade.type != 'out') return

        this.fade.a += 3
        ctx.fillStyle = rgb(
            this.fade.r,
            this.fade.g,
            this.fade.b,
            this.fade.a
        )
        ctx.fillRect(0, 0, cvs.width, cvs.height)

        let size = (cvs.width + cvs.height) / 50
        if (size < 20) size = 20

        ctx.font = size + 'px "Courier New", monospace'
        ctx.fillStyle = rgb(255, 255, 255, this.fade.a)
        ctx.textAlign = 'center'
        if (map.level == map.level_end - 2)
            ctx.fillText('FINAL LEVEl', cvs.width / 2, cvs.height / 2)
        else
            ctx.fillText('LEVEl ' + (map.level + 1), cvs.width / 2, cvs.height / 2)
        cam.zoom += 1

        if (this.fade.a >= 255) return true
        return false
    }

    fadeIn() {
        if (this.fade.type != 'in') return

        this.fade.a -= 3
        ctx.fillStyle = rgb(
            this.fade.r,
            this.fade.g,
            this.fade.b,
            this.fade.a
        )
        ctx.fillRect(0, 0, cvs.width, cvs.height)

        let size = (cvs.width + cvs.height) / 50
        if (size < 20) size = 20

        ctx.font = size + 'px "Courier New", monospace'
        ctx.fillStyle = rgb(255, 255, 255, this.fade.a)
        ctx.textAlign = 'center'

        if (map.level == map.level_end - 1)
            ctx.fillText('FINAL LEVEl', cvs.width / 2, cvs.height / 2)
        else
            ctx.fillText('LEVEl ' + map.level, cvs.width / 2, cvs.height / 2)

        if (this.fade.a <= 0) {
            this.fade.a = 0
            return true
        }
        return false
    }

    over() {
        if (this.fade.type != 'over') return

        this.fade.a += 4
        ctx.fillStyle = rgb(
            0, 0, 0,
            this.fade.a
        )
        ctx.fillRect(0, 0, cvs.width, cvs.height)

        let size = (cvs.width + cvs.height) / 30
        if (size < 20) size = 20

        ctx.font = size + 'px "Courier New", monospace'
        ctx.fillStyle = rgb(255, 255, 255, this.fade.a)
        ctx.textAlign = 'center'
        ctx.fillText('GAME OVER', cvs.width / 2, cvs.height / 2)

        // Show difficulty-specific restart message
        const smallSize = size * 0.6
        ctx.font = smallSize + 'px "Courier New", monospace'
        const difficultyColor = gameDifficulty === 'easy' ? [0, 255, 0] : [255, 0, 0]
        ctx.fillStyle = rgb(difficultyColor[0], difficultyColor[1], difficultyColor[2], this.fade.a)
        
        const restartMessage = gameDifficulty === 'easy' ? 
            'Respawning at level ' + map.level : 
            'Restarting from level 1'
        ctx.fillText(restartMessage, cvs.width / 2, cvs.height / 2 + size)

        if (this.fade.a >= 1000) {
            // Handle different restart behaviors based on difficulty
            if (gameDifficulty === 'easy') {
                // Easy mode: respawn at current level, just reset hero
                hero.reset()
                map.set()
                map.generate()
                cam.zoom = 50
                screen.set()
                screen.fade.type = 'in'
                screen.fade.a = 255
                game = true
            } else {
                // Hard mode: restart from beginning
                restart()
            }
        }
    }

    win() {
        if (this.fade.type != 'win') return

        this.fade.a += 1
        ctx.fillStyle = rgb(
            255, 255, 255,
            this.fade.a
        )
        ctx.fillRect(0, 0, cvs.width, cvs.height)

        let size = (cvs.width + cvs.height) / 30
        if (size < 20) size = 20

        ctx.font = size + 'px "Courier New", monospace'
        ctx.fillStyle = rgb(0, 0, 0, this.fade.a)
        ctx.textAlign = 'center'
        ctx.fillText('MISSION CLOMPLETE', cvs.width / 2, cvs.height / 2)
    }
}

class Number {
    constructor(d, scale_pos = true) {
        if (scale_pos) {
            this.x = d.x * scale - cam.offset_x
            this.y = d.y * scale - cam.offset_y
        }
        else {
            this.x = d.x
            this.y = d.y
        }
        this.speed_x = d.speed_x
        this.speed_y = d.speed_y
        this.text = d.text
        this.color = d.color
        this.fade_speed = d.fade_speed

        if (this.color.length == 1) this.color = [255, 255, 255, 255]
    }

    update() {
        this.x += this.speed_x
        this.y += this.speed_y

        this.color[3] -= this.fade_speed

        if (this.color[3] <= 0)
            screen.numbers.splice(screen.numbers.indexOf(this), 1)

        this.draw()
    }

    draw() {
        ctx.fillStyle = rgb(
            this.color[0],
            this.color[1],
            this.color[2],
            this.color[3]
        )
        ctx.font = (cvs.width + cvs.height) / 80 + 'px "Courier New", monospace'
        ctx.textAlign = 'center'
        ctx.fillText(this.text, this.x, this.y)

    }
}
