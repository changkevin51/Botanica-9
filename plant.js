// Plant class for growing plants

class Plant extends Base {
    constructor(d) {
        super()

        this.min_growth = d.min_growth
        this.max_growth = d.max_growth
        this.stem_limit_min = d.stem_limit_min
        this.stem_limit_max = d.stem_limit_max

        this.x = d.x - .5
        this.y = d.y - 1
        this.width = 1
        this.height = 1

        this.stems = [{
            x: d.x,
            y: d.y,
            angle: random(-20, 20),
            length: 0,
            goal_length: random(.1, .5, 0),
            color: '#543', complete: 0
        }]

        if (d.color.length == 1) {
            this.color = [
                random(50, 255),
                random(50, 255),
                random(50, 255),
                random(100, 255)
            ]

        }
        else this.color = d.color

        this.angle = random(0, 360)

        this.grow = true
        this.die = false
    }

    death() {
        let item = this.stems[this.stems.length - 1]

        this.color[3] -= this.color[3] / 10
        item.length -= (item.length + 1) * item.goal_length / (20 / this.stems.length)

        if (item.length <= 0) this.stems.splice(this.stems.length - 1, 1)

        if (this.stems.length <= 0) {
            map.plants.splice(map.plants.indexOf(this), 1)
            map.plant_screen.splice(map.plant_screen.indexOf(this), 1)
        }
    }

    update() {
        if (!this.onScreen()) {
            map.plants_on_screen --
            return
        }

        if (this.die) {
            this.death()
            this.draw()
            return
        }

        if (this.grow) {
            this.stems.forEach(item => {
                if (item.length < item.goal_length)
                    item.length += (item.length + 1) * item.goal_length / 20
                else item.complete ++

                if (item.complete == 1) {
                    const growth_amount = random(this.min_growth, this.max_growth)
                    for (let i = 0; i < growth_amount; i ++) {
                        this.stems.push({
                            x: item.x +
                                cos(item.angle - 90) * item.length,
                            y: item.y + 
                                sin(item.angle - 90) * item.length,
                            angle: item.angle + random(-30, 30, 0),
                            length: 0,
                            goal_length: random(.1, .3, 0),
                            color: rgb(50, random(50, 100), 0),
                            complete: 0
                        })
                    }
                }

                if (this.stems.length > random(this.stem_limit_min, this.stem_limit_max)) this.grow = false
            })
        }

        this.draw()
    }

    draw() {
        this.stems.forEach((item, index) => {
            ctx.beginPath()

            ctx.strokeStyle = item.color
            line(
                item.x, item.y,
                item.x + cos(item.angle - 90) * item.length,
                item.y + sin(item.angle - 90) * item.length, .01
            )
            ctx.fillStyle = rgb(
                this.color[0] + ((index * 99) % 255),
                this.color[1],
                this.color[2],
                this.color[3]
            )
            stretchRect(
                cos(item.angle - 90) * item.length - .025,
                sin(item.angle - 90) * item.length - .025,
                .05, .05, {x: item.x, y: item.y, width: 1, height: 1}
            )
        })
    }
}
