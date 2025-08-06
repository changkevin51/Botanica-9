// Camera class for handling view and zoom

class Camera {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.zoom = 50
        this.shake = 100
        this.shift = 0
    }

    update() {
        this.x += (hero.x - this.x) / 3
        this.y += (hero.y - this.y) / 10

        if (this.shake) {
            this.shake --
            this.x += random(-this.shift / 2, this.shift, 0) * this.zoom
            this.y += random(-this.shift / 2, this.shift, 0) * this.zoom
        }

        const normal_zoom = 6
        const zoom_point = cvs.height * .9
        const left_zoom = -map.array[~~this.x + 1] * scale - this.offset_y
        const right_zoom = -map.array[~~(this.x + hero.width) - 1] * scale - this.offset_y
        const largest_zoom = left_zoom > right_zoom ? left_zoom : right_zoom
        
        if (largest_zoom > zoom_point) this.zoom += (largest_zoom - zoom_point) / 400
        else this.zoom -= (this.zoom - normal_zoom) / 100
    }

    get offset_x() {return this.x * scale - cvs.width / 2}
    get offset_y() {return this.y * scale - cvs.height / 2}
}
