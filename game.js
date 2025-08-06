'use strict'
const cvs = document.getElementById('cvs')
const ctx = cvs.getContext('2d')
const gravity = .01
let scale = 0
let game = false
let gameState = 'title' 
let gameDifficulty = 'easy' // 'easy' or 'hard'
let difficultySelection = 0 // 0 for easy, 1 for hard
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

// Pixelated robot drawing functions for difficulty selection
function drawPixelatedRobot(x, y, size, isHard = false, opacity = 1) {
    const pixelSize = size / 8
    
    ctx.save()
    ctx.globalAlpha = opacity
    
    // Disable anti-aliasing for pixelated effect
    ctx.imageSmoothingEnabled = false
    
    const colors = isHard ? {
        main: '#800',      // Dark red for hard mode
        face: '#a66',      // Red face
        eye: '#f00',       // Bright red eyes
        arm: '#400',       // Very dark red arms
        accent: '#f80'     // Orange accent
    } : {
        main: '#666',      // Gray for easy mode
        face: '#888',      // Light gray face
        eye: '#221',       // Dark eyes
        arm: '#444',       // Dark gray arms
        accent: '#0a0'     // Green accent
    }
    
    // Draw robot using pixel blocks
    function drawPixel(px, py, color) {
        ctx.fillStyle = color
        ctx.fillRect(x + px * pixelSize, y + py * pixelSize, pixelSize, pixelSize)
    }
    
    // Head (4x3 pixels) - at the top
    for (let i = 2; i < 6; i++) {
        for (let j = 0; j < 3; j++) {
            drawPixel(i, j, colors.main)
        }
    }
    
    // Face area (2x2 pixels) - inside head
    for (let i = 3; i < 5; i++) {
        for (let j = 1; j < 3; j++) {
            drawPixel(i, j, colors.face)
        }
    }
    
    // Eyes (1 pixel each) - in the face area
    drawPixel(3, 1, colors.eye)
    drawPixel(4, 1, colors.eye)
    
    // Extra angry features for hard mode
    if (isHard) {
        // Angry eyebrows
        drawPixel(2, 0, colors.accent)
        drawPixel(5, 0, colors.accent)
        // Gritted teeth/mouth
        drawPixel(3, 2, colors.accent)
        drawPixel(4, 2, colors.accent)
    }
    
    // Neck (2x1 pixels) - below head
    drawPixel(3, 3, colors.main)
    drawPixel(4, 3, colors.main)
    
    // Body (4x3 pixels) - below neck
    for (let i = 2; i < 6; i++) {
        for (let j = 4; j < 7; j++) {
            drawPixel(i, j, colors.main)
        }
    }
    
    // Arms (1x1 pixels each) - on sides of body
    drawPixel(1, 5, colors.arm)
    drawPixel(6, 5, colors.arm)
    
    // Accent color details on body
    drawPixel(3, 4, colors.accent)
    drawPixel(4, 4, colors.accent)
    
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
    titleAnimationTime = 0
    difficultySelection = 0
}

function start() {
    // Disable image smoothing for pixelated effect
    ctx.imageSmoothingEnabled = false
    
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
        
        // Add animated "Press SPACE to continue" text with pixelated font
        const size = Math.min(cvs.width, cvs.height) / 20
        ctx.font = size + 'px "Courier New", monospace'
        ctx.textAlign = 'center'
        
        const fadeOpacity = (Math.sin(titleAnimationTime) + 1) / 2 
        
        const text = 'Press SPACE to continue'
        const textY = cvs.height - size * 2
        
        const robotSize = Math.min(cvs.width, cvs.height) / 15
        const robotY = textY - size * 3 - robotSize
        drawPixelatedRobot(cvs.width / 2 - robotSize/2, robotY, robotSize, false, fadeOpacity)
        
        ctx.fillStyle = `rgba(255, 255, 255, ${fadeOpacity})`
        ctx.strokeStyle = `rgba(0, 0, 0, ${fadeOpacity * 0.8})`
        ctx.lineWidth = 2
        
        ctx.strokeText(text, cvs.width / 2, textY)
        ctx.fillText(text, cvs.width / 2, textY)
        
        if (key.space) {
            key.space = false // Reset the key to prevent multiple triggers
            gameState = 'difficulty'
        }
        
        requestAnimationFrame(start)
    } else if (gameState === 'difficulty') {
        titleAnimationTime += 0.05
        
        // Clear screen with dark background
        ctx.fillStyle = '#111'
        ctx.fillRect(0, 0, cvs.width, cvs.height)
        
        // Title
        const titleSize = Math.min(cvs.width, cvs.height) / 15
        ctx.font = `bold ${titleSize}px "Courier New", monospace`
        ctx.textAlign = 'center'
        ctx.fillStyle = '#fff'
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 3
        ctx.strokeText('SELECT DIFFICULTY', cvs.width / 2, titleSize * 2)
        ctx.fillText('SELECT DIFFICULTY', cvs.width / 2, titleSize * 2)
        
        // Robot displays and labels
        const robotSize = Math.min(cvs.width, cvs.height) / 8
        const spacing = cvs.width / 3
        const robotY = cvs.height / 2 - robotSize
        
        // Easy mode robot (left)
        const easyX = spacing - robotSize/2
        const easySelected = difficultySelection === 0
        const easyOpacity = easySelected ? 1 : 0.7
        const easyScale = easySelected ? 1.1 : 1
        
        ctx.save()
        ctx.translate(easyX + robotSize/2, robotY + robotSize/2)
        ctx.scale(easyScale, easyScale)
        drawPixelatedRobot(-robotSize/2, -robotSize/2, robotSize, false, easyOpacity)
        ctx.restore()
        
        // Hard mode robot (right)
        const hardX = spacing * 2 - robotSize/2
        const hardSelected = difficultySelection === 1
        const hardOpacity = hardSelected ? 1 : 0.7
        const hardScale = hardSelected ? 1.1 : 1
        
        ctx.save()
        ctx.translate(hardX + robotSize/2, robotY + robotSize/2)
        ctx.scale(hardScale, hardScale)
        drawPixelatedRobot(-robotSize/2, -robotSize/2, robotSize, true, hardOpacity)
        ctx.restore()
        
        // Labels
        const labelSize = Math.min(cvs.width, cvs.height) / 25
        ctx.font = `bold ${labelSize}px "Courier New", monospace`
        
        // Easy label
        ctx.fillStyle = easySelected ? '#0f0' : '#888'
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 2
        const easyText = 'EASY MODE'
        ctx.strokeText(easyText, spacing, robotY + robotSize + labelSize * 2)
        ctx.fillText(easyText, spacing, robotY + robotSize + labelSize * 2)
        
        // Hard label
        ctx.fillStyle = hardSelected ? '#f00' : '#888'
        const hardText = 'HARD MODE'
        ctx.strokeText(hardText, spacing * 2, robotY + robotSize + labelSize * 2)
        ctx.fillText(hardText, spacing * 2, robotY + robotSize + labelSize * 2)
        
        // Description
        const descSize = Math.min(cvs.width, cvs.height) / 35
        ctx.font = `${descSize}px "Courier New", monospace`
        ctx.fillStyle = '#ccc'
        
        const easyDesc = 'Respawn at current level'
        const hardDesc = 'Restart from level 1'
        const selectedDesc = difficultySelection === 0 ? easyDesc : hardDesc
        
        ctx.fillText(selectedDesc, cvs.width / 2, robotY + robotSize + labelSize * 4)
        
        // Controls
        const controlSize = Math.min(cvs.width, cvs.height) / 30
        ctx.font = `${controlSize}px "Courier New", monospace`
        ctx.fillStyle = '#aaa'
        
        const fadeControlOpacity = (Math.sin(titleAnimationTime * 2) + 1) / 2
        ctx.fillStyle = `rgba(170, 170, 170, ${fadeControlOpacity})`
        
        ctx.fillText('Use LEFT(A)/RIGHT(D) arrows to select, SPACE to start', cvs.width / 2, cvs.height - controlSize * 2)
        
        // Handle input
        if (key.arrowleft || key.a) {
            difficultySelection = 0
            key.arrowleft = false
            key.a = false
        }
        if (key.arrowright || key.d) {
            difficultySelection = 1
            key.arrowright = false
            key.d = false
        }
        
        if (key.space) {
            gameDifficulty = difficultySelection === 0 ? 'easy' : 'hard'
            gameState = 'transition'
            screen.fade.type = 'out'
            screen.fade.a = 0
            key.space = false
        }
        
        requestAnimationFrame(start)
    } else if (gameState === 'transition') {
        ctx.fillStyle = '#111'
        ctx.fillRect(0, 0, cvs.width, cvs.height)
        
        // Show selected difficulty during transition
        const size = Math.min(cvs.width, cvs.height) / 20
        ctx.font = `bold ${size}px "Courier New", monospace`
        ctx.textAlign = 'center'
        ctx.fillStyle = gameDifficulty === 'easy' ? '#0f0' : '#f00'
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 3
        
        const diffText = (gameDifficulty === 'easy' ? 'EASY' : 'HARD') + ' MODE SELECTED'
        ctx.strokeText(diffText, cvs.width / 2, cvs.height / 2)
        ctx.fillText(diffText, cvs.width / 2, cvs.height / 2)
        
        screen.fade.a += 3
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
