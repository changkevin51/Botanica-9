'use strict'
const cvs = document.getElementById('cvs')
const ctx = cvs.getContext('2d')
const gravity = .01
let scale = 0
let game = false
let gameState = 'title' 
let titleAnimationTime = 0 

const titleImage = new Image()
titleImage.src = 'titlepage.png'

const cam = new Camera(0, 0)
const map = new World()
const hero = new Player(.25, .3)
const screen = new Screen()

function resize() {
    cvs.width = innerWidth
    cvs.height = innerHeight
}

// Simple robot drawing function for title screen
function drawTitleRobot(x, y, size, opacity = 1) {
    const robotWidth = size
    const robotHeight = size * 1.5
    
    ctx.save()
    ctx.globalAlpha = opacity
    
    // Head
    ctx.fillStyle = '#666'
    ctx.fillRect(x - robotWidth/2, y, robotWidth, robotHeight * 0.4)
    
    // Neck
    ctx.fillStyle = '#666'
    ctx.fillRect(x - robotWidth * 0.06, y + robotHeight * 0.4, robotWidth * 0.12, robotHeight * 0.2)
    
    // Body
    ctx.fillStyle = '#666'
    ctx.fillRect(x - robotWidth/2, y + robotHeight * 0.5, robotWidth, robotHeight * 0.5)
    
    // Face
    ctx.fillStyle = '#888'
    ctx.fillRect(x - robotWidth * 0.4, y + robotHeight * 0.1, robotWidth * 0.8, robotHeight * 0.2)
    
    // Arms
    ctx.fillStyle = '#444'
    const armSize = robotWidth * 0.1
    ctx.fillRect(x - robotWidth * 0.75, y + robotHeight * 0.6, armSize, armSize)
    ctx.fillRect(x + robotWidth * 0.65, y + robotHeight * 0.6, armSize, armSize)
    
    // Eyes
    ctx.fillStyle = '#221'
    const eyeSize = robotWidth * 0.08
    ctx.fillRect(x - robotWidth * 0.15, y + robotHeight * 0.15, eyeSize, eyeSize)
    ctx.fillRect(x + robotWidth * 0.07, y + robotHeight * 0.15, eyeSize, eyeSize)
    
    ctx.restore()
}

function update() {
    ctx.clearRect(0, 0, cvs.width, cvs.height)
    scale = cvs.width / cam.zoom

    screen.background()
    cam.update()
    map.update()
    screen.foreground()

    screen.fadeOut()
    screen.fadeIn()
    screen.over()
    screen.win()

    if (hero.power < 0) hero.power = 0
    if (hero.power > hero.max_power) hero.power = hero.max_power

    game ? requestAnimationFrame(update) : start()
}

function restart() {
    cam.zoom = 50
    map.level = 0
    map.width = map.level_end
    map.set()
    map.generate()

    hero.reset()
    screen.set()
    gameState = 'title'
    game = false
    titleAnimationTime = 0 // Reset animation timer
}

function start() {
    if (gameState === 'title') {
        // Update animation timer
        titleAnimationTime += 0.05
        
        // Clear screen with black background
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, cvs.width, cvs.height)
        
        // Draw title image to fill the entire screen
        if (titleImage.complete) {
            ctx.drawImage(titleImage, 0, 0, cvs.width, cvs.height)
        }
        
        // Add animated "Press SPACE to start" text
        const size = Math.min(cvs.width, cvs.height) / 20
        ctx.font = size + 'px tahoma'
        ctx.textAlign = 'center'
        
        const fadeOpacity = (Math.sin(titleAnimationTime) + 1) / 2 
        const textAlpha = Math.floor(fadeOpacity * 255)
        
        const text = 'Press SPACE to start'
        const textY = cvs.height - size * 2
        
        const robotSize = Math.min(cvs.width, cvs.height) / 15
        const robotY = textY - size * 3 - robotSize
        drawTitleRobot(cvs.width / 2, robotY, robotSize, fadeOpacity)
        
        ctx.fillStyle = `rgba(255, 255, 255, ${fadeOpacity})`
        ctx.strokeStyle = `rgba(0, 0, 0, ${fadeOpacity})`
        ctx.lineWidth = 3
        
        ctx.strokeText(text, cvs.width / 2, textY)
        ctx.fillText(text, cvs.width / 2, textY)
        
        if (key.space) {
            gameState = 'transition'
            screen.fade.type = 'out'
            screen.fade.a = 0
        }
        
        requestAnimationFrame(start)
    } else if (gameState === 'transition') {
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, cvs.width, cvs.height)
        
        if (titleImage.complete) {
            ctx.drawImage(titleImage, 0, 0, cvs.width, cvs.height)
        }
        
        screen.fade.a += 5
        ctx.fillStyle = rgb(0, 0, 0, screen.fade.a)
        ctx.fillRect(0, 0, cvs.width, cvs.height)
        
        if (screen.fade.a >= 255) {
            gameState = 'playing'
            game = true
            screen.fade.type = 'in'
            screen.fade.a = 255
            update()
        } else {
            requestAnimationFrame(start)
        }
    }
}

map.generate()
addEventListener('resize', resize)
initializeInput()
resize()
start()
