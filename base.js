class Base {
    screen() {
        const x = this.x * scale - cam.offset.x
        const y = this.y * scale - cam.offset.y
        const width = this.width * scale
        const height = this.height * scale
        return (
            x + width > 0 && x < cvs.width &&
            y + height > 0 && y < cvs.width)
    }

    onScreen() {
        const x = this.x * scale - cam.offset_x
        const y = this.y * scale - cam.offset_y
        const width = this.width * scale
        const height = this.height * scale
        return (
            x < cvs.width &&
            x + width > 0 &&
            y < cvs.height &&
            y + height > 0
        )
    }
}
