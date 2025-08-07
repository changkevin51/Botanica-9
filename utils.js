
function random(min, max, int = 1) {
    const value = Math.random() * (max - min) + min
    return int ? Math.floor(value) : value
}

function translate(x, y, obj) {
    x = x * obj.width
    y = y * obj.height
    return ctx.translate(
        (x + obj.x) * scale - cam.offset_x,
        (y + obj.y) * scale - cam.offset_y
    )
}

function collide(obj1, obj2) {
    return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y
    )
}

function merge(obj1, obj2) {
    const margin = {
        left: (obj1.x + obj1.width) - obj2.x,
        right: obj1.x - (obj2.x + obj2.width),
        top: (obj1.y + obj1.height) - obj2.y,
        bottom: obj1.y - (obj2.y + obj2.height)
    }
    const smallest_x =
        margin.left < -margin.right ?
        margin.left : margin.right
    const smallest_y =
        margin.top < -margin.bottom ?
        margin.top : margin.bottom
    if (Math.abs(smallest_x) < Math.abs(smallest_y) - obj1.speed_y)
        return {x: smallest_x, y: 0}
    return {x: 0, y: smallest_y}
}

function rotate(angle) {
    return ctx.rotate((angle % 360) * Math.PI / 180)
}

function cos(angle) {
    return Math.cos(angle * Math.PI / 180)
}

function sin(angle) {
    return Math.sin(angle * Math.PI / 180)
}

function line(x1, y1, x2, y2, width) {
    ctx.lineWidth = width * scale
    ctx.moveTo(
        x1 * scale - cam.offset_x,
        y1 * scale - cam.offset_y
    )
    ctx.lineTo(
        x2 * scale - cam.offset_x,
        y2 * scale - cam.offset_y
    )
    ctx.stroke()
}

function stretch(x, y, width, height, obj) {
    return {
        x: x * obj.width,
        y: y * obj.height,
        width: width * obj.width,
        height: height * obj.height
    }
}

function scaleRect(x, y, width, height, obj, ahr_x = 0, ahr_y = 0) {
    x = x * obj.width
    y = y * obj.height
    width = width * obj.width
    height = height * obj.height
    ahr_x = ahr_x * obj.width
    ahr_y = ahr_y * obj.height
    return ctx.fillRect(
        (x - ahr_x) * scale,
        (y - ahr_y) * scale,
        width * scale, height * scale
    )
}

function scaleCir(x, y, radius, obj, ahr_x = 0, ahr_y = 0) {
    x = x * obj.width
    y = y * obj.height
    radius = radius * (obj.width > obj.height ? obj.height : obj.width)
    ahr_x = ahr_x * obj.width
    ahr_y = ahr_y * obj.height
    return (
        ctx.beginPath(),
        ctx.fill(ctx.arc(
            (x - ahr_x) * scale,
            (y - ahr_y) * scale, 
            radius * scale, 0, 7))
    )
}

function stretchRect(x, y, width, height, obj) {
    x = x * obj.width
    y = y * obj.height
    width = width * obj.width
    height = height * obj.height
    ctx.fillRect(
        (obj.x + x) * scale - cam.offset_x,
        (obj.y + y) * scale - cam.offset_y,
        width * scale,
        height * scale
    )
}

function stretchCir(x, y, radius, obj) {
    x = x * obj.width
    y = y * obj.height
    radius = radius * (obj.width > obj.height ? obj.height : obj.width)
    ctx.beginPath()
    ctx.fill(ctx.arc(
        (obj.x + x) * scale - cam.offset_x,
        (obj.y + y) * scale - cam.offset_y,
        radius * scale, 0, 7
    ))
}

function rgb(red, green, blue, alpha = 255) {
    return `rgb(${red}, ${green}, ${blue}, ${alpha / 255})`
}
