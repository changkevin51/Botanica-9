'use strict'
const cvs = document.getElementById('cvs')
const ctx = cvs.getContext('2d')
const gravity = .01
let scale = 0
let game = false
let gameState = 'title'
let gameDifficulty = 'easy'
let difficultySelection = 0
let titleAnimationTime = 0

let upgradeSelection = 0
let playerUpgrades = {
    maxHealth: 3,
    baseDamage: 1,
    damageMultiplier: 1.0,
    abilities: [],
    levelsCompleted: 0
}

const titleImage = new Image()
titleImage.src = 'titlepage.png'

const cam = new Camera(0, 0)
const map = new World()
const hero = new Player(.25, .3)
const screen = new Screen()

// Initialize upgrade system
playerUpgrades.maxHealth = 3
playerUpgrades.baseDamage = 1
playerUpgrades.damageMultiplier = 1.0
playerUpgrades.abilities = []
playerUpgrades.levelsCompleted = 0

function resize() {
    cvs.width = innerWidth
    cvs.height = innerHeight
}

function drawPixelatedRobot(x, y, size, isHard = false, opacity = 1) {
    const pixelSize = size / 8
    
    ctx.save()
    ctx.globalAlpha = opacity
    
    ctx.imageSmoothingEnabled = false
    const colors = isHard ? {
        main: '#800',
        face: '#a66',
        eye: '#f00',
        arm: '#400',
        accent: '#f80'
    } : {
        main: '#666',
        face: '#888',
        eye: '#221',
        arm: '#444',
        accent: '#0a0'
    }
    
    function drawPixel(px, py, color) {
        ctx.fillStyle = color
        ctx.fillRect(x + px * pixelSize, y + py * pixelSize, pixelSize, pixelSize)
    }
    for (let i = 2; i < 6; i++) {
        for (let j = 0; j < 3; j++) {
            drawPixel(i, j, colors.main)
        }
    }
    for (let i = 3; i < 5; i++) {
        for (let j = 1; j < 3; j++) {
            drawPixel(i, j, colors.face)
        }
    }
    drawPixel(3, 1, colors.eye)
    drawPixel(4, 1, colors.eye)
    if (isHard) {
        drawPixel(2, 0, colors.accent)
        drawPixel(5, 0, colors.accent)
        drawPixel(3, 2, colors.accent)
        drawPixel(4, 2, colors.accent)
    }
    drawPixel(3, 3, colors.main)
    drawPixel(4, 3, colors.main)
    for (let i = 2; i < 6; i++) {
        for (let j = 4; j < 7; j++) {
            drawPixel(i, j, colors.main)
        }
    }
    drawPixel(1, 5, colors.arm)
    drawPixel(6, 5, colors.arm)
    drawPixel(3, 4, colors.accent)
    drawPixel(4, 4, colors.accent)
    ctx.restore()
}

function applyUpgrade(upgradeType) {
    switch(upgradeType) {
        case 0:
            playerUpgrades.maxHealth += 1
            hero.health = Math.min(hero.health + 1, playerUpgrades.maxHealth)
            break
        case 1:
            playerUpgrades.damageMultiplier += 0.25
            break
        case 2:
            const availableAbilities = ['homing', 'explosive', 'seedbomb', 'cloner']
            const randomAbility = availableAbilities[Math.floor(Math.random() * availableAbilities.length)]
            if (!playerUpgrades.abilities.includes(randomAbility)) {
                playerUpgrades.abilities.push(randomAbility)
                let abilityDescription = ''
                if (randomAbility === 'homing') {
                    abilityDescription = 'HOMING SEEDS: Every 5th shot will track enemies!'
                } else if (randomAbility === 'explosive') {
                    abilityDescription = 'EXPLOSIVE SEEDS: Every 5th shot will explode on impact!'
                } else if (randomAbility === 'seedbomb') {
                    abilityDescription = 'SEED BOMB: Every 5th shot spreads multiple seeds!'
                } else if (randomAbility === 'cloner') {
                    abilityDescription = 'CLONER: Every 5th shot creates helpful plant allies!'
                }
                screen.numbers.push(new Number({
                    x: cvs.width / 2,
                    y: cvs.height / 2 + 100,
                    speed_x: 0,
                    speed_y: -0.5,
                    text: abilityDescription,
                    color: [255, 255, 0, 255],
                    fade_speed: 1.5
                }, false))
            }
            break
    }
}

function drawUpgradeIcon(x, y, size, upgradeType, isSelected = false) {
    const pixelSize = size / 8
    
    ctx.save()
    ctx.globalAlpha = isSelected ? 1 : 0.7
    
    ctx.imageSmoothingEnabled = false
    
    const colors = {
        health: '#f00',
        damage: '#f80', 
        ability: '#0f0',
        background: isSelected ? '#fff' : '#666'
    }
    
    function drawPixel(px, py, color) {
        ctx.fillStyle = color
        ctx.fillRect(x + px * pixelSize, y + py * pixelSize, pixelSize, pixelSize)
    }
    
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            drawPixel(i, j, colors.background)
        }
    }
    if (upgradeType === 0) {
        drawPixel(1, 2, colors.health)
        drawPixel(2, 1, colors.health)
        drawPixel(3, 2, colors.health)
        drawPixel(4, 2, colors.health)
        drawPixel(5, 1, colors.health)
        drawPixel(6, 2, colors.health)
        drawPixel(1, 3, colors.health)
        drawPixel(2, 3, colors.health)
        drawPixel(3, 3, colors.health)
        drawPixel(4, 3, colors.health)
        drawPixel(5, 3, colors.health)
        drawPixel(6, 3, colors.health)
        drawPixel(2, 4, colors.health)
        drawPixel(3, 4, colors.health)
        drawPixel(4, 4, colors.health)
        drawPixel(5, 4, colors.health)
        drawPixel(3, 5, colors.health)
        drawPixel(4, 5, colors.health)
    } else if (upgradeType === 1) {
        drawPixel(2, 1, colors.damage)
        drawPixel(3, 2, colors.damage)
        drawPixel(4, 3, colors.damage)
        drawPixel(5, 4, colors.damage)
        drawPixel(6, 5, colors.damage)
        drawPixel(1, 5, colors.damage)
        drawPixel(2, 6, colors.damage)
        drawPixel(1, 6, colors.damage)
    } else if (upgradeType === 2) {
        drawPixel(2, 1, colors.ability)
        drawPixel(3, 1, colors.ability)
        drawPixel(4, 1, colors.ability)
        drawPixel(5, 1, colors.ability)
        drawPixel(1, 2, colors.ability)
        drawPixel(6, 2, colors.ability)
        drawPixel(5, 3, colors.ability)
        drawPixel(4, 4, colors.ability)
        drawPixel(3, 5, colors.ability)
        drawPixel(3, 7, colors.ability)
    }
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

    if (gameState === 'upgrade') {
        game = false
    }

    game ? requestAnimationFrame(update) : start()
}

function restart() {
    cam.zoom = 50
    map.level = 0
    map.width = map.level_end
    map.set()
    map.generate()

    playerUpgrades.maxHealth = 3
    playerUpgrades.baseDamage = 1
    playerUpgrades.damageMultiplier = 1.0
    playerUpgrades.abilities = []
    playerUpgrades.levelsCompleted = 0

    hero.reset()
    screen.set()
    gameState = 'title'
    game = false
    titleAnimationTime = 0
    difficultySelection = 0
    upgradeSelection = 0
}

function start() {
    ctx.imageSmoothingEnabled = false
    if (gameState === 'title') {
        titleAnimationTime += 0.05
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, cvs.width, cvs.height)
        if (titleImage.complete) {
            ctx.drawImage(titleImage, 0, 0, cvs.width, cvs.height)
        }
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
            key.space = false
            gameState = 'difficulty'
        }
        requestAnimationFrame(start)
    } else if (gameState === 'difficulty') {
        titleAnimationTime += 0.05
        
        ctx.fillStyle = '#111'
        ctx.fillRect(0, 0, cvs.width, cvs.height)
        const titleSize = Math.min(cvs.width, cvs.height) / 15
        ctx.font = `bold ${titleSize}px "Courier New", monospace`
        ctx.textAlign = 'center'
        ctx.fillStyle = '#fff'
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 3
        ctx.strokeText('SELECT DIFFICULTY', cvs.width / 2, titleSize * 2)
        ctx.fillText('SELECT DIFFICULTY', cvs.width / 2, titleSize * 2)
        const robotSize = Math.min(cvs.width, cvs.height) / 8
        const spacing = cvs.width / 3
        const robotY = cvs.height / 2 - robotSize
        const easyX = spacing - robotSize/2
        const easySelected = difficultySelection === 0
        const easyOpacity = easySelected ? 1 : 0.7
        const easyScale = easySelected ? 1.1 : 1
        ctx.save()
        ctx.translate(easyX + robotSize/2, robotY + robotSize/2)
        ctx.scale(easyScale, easyScale)
        drawPixelatedRobot(-robotSize/2, -robotSize/2, robotSize, false, easyOpacity)
        ctx.restore()
        const hardX = spacing * 2 - robotSize/2
        const hardSelected = difficultySelection === 1
        const hardOpacity = hardSelected ? 1 : 0.7
        const hardScale = hardSelected ? 1.1 : 1
        ctx.save()
        ctx.translate(hardX + robotSize/2, robotY + robotSize/2)
        ctx.scale(hardScale, hardScale)
        drawPixelatedRobot(-robotSize/2, -robotSize/2, robotSize, true, hardOpacity)
        ctx.restore()
        const labelSize = Math.min(cvs.width, cvs.height) / 25
        ctx.font = `bold ${labelSize}px "Courier New", monospace`
        ctx.fillStyle = easySelected ? '#0f0' : '#888'
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 2
        const easyText = 'EASY MODE'
        ctx.strokeText(easyText, spacing, robotY + robotSize + labelSize * 2)
        ctx.fillText(easyText, spacing, robotY + robotSize + labelSize * 2)
        ctx.fillStyle = hardSelected ? '#f00' : '#888'
        const hardText = 'HARD MODE'
        ctx.strokeText(hardText, spacing * 2, robotY + robotSize + labelSize * 2)
        ctx.fillText(hardText, spacing * 2, robotY + robotSize + labelSize * 2)
        const descSize = Math.min(cvs.width, cvs.height) / 35
        ctx.font = `${descSize}px "Courier New", monospace`
        ctx.fillStyle = '#ccc'
        const easyDesc = 'Respawn at current level'
        const hardDesc = 'Restart from level 1'
        const selectedDesc = difficultySelection === 0 ? easyDesc : hardDesc
        ctx.fillText(selectedDesc, cvs.width / 2, robotY + robotSize + labelSize * 4)
        const controlSize = Math.min(cvs.width, cvs.height) / 30
        ctx.font = `${controlSize}px "Courier New", monospace`
        ctx.fillStyle = '#aaa'
        const fadeControlOpacity = (Math.sin(titleAnimationTime * 2) + 1) / 2
        ctx.fillStyle = `rgba(170, 170, 170, ${fadeControlOpacity})`
        ctx.fillText('Use LEFT(A)/RIGHT(D) arrows to select, SPACE to start', cvs.width / 2, cvs.height - controlSize * 2)
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
    } else if (gameState === 'upgrade') {
        titleAnimationTime += 0.05
        
        ctx.fillStyle = '#111'
        ctx.fillRect(0, 0, cvs.width, cvs.height)
        const titleSize = Math.min(cvs.width, cvs.height) / 20
        ctx.font = `bold ${titleSize}px "Courier New", monospace`
        ctx.textAlign = 'center'
        ctx.fillStyle = '#fff'
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 3
        ctx.strokeText('LEVEL COMPLETE - SELECT UPGRADE', cvs.width / 2, titleSize * 2)
        ctx.fillText('LEVEL COMPLETE - SELECT UPGRADE', cvs.width / 2, titleSize * 2)
        const iconSize = Math.min(cvs.width, cvs.height) / 10
        const spacing = cvs.width / 4
        const iconY = cvs.height / 2 - iconSize / 2
        const healthX = spacing - iconSize / 2
        drawUpgradeIcon(healthX, iconY, iconSize, 0, upgradeSelection === 0)
        const damageX = spacing * 2 - iconSize / 2
        drawUpgradeIcon(damageX, iconY, iconSize, 1, upgradeSelection === 1)
        const abilityX = spacing * 3 - iconSize / 2
        drawUpgradeIcon(abilityX, iconY, iconSize, 2, upgradeSelection === 2)
        const labelSize = Math.min(cvs.width, cvs.height) / 30
        ctx.font = `bold ${labelSize}px "Courier New", monospace`
        ctx.fillStyle = upgradeSelection === 0 ? '#f00' : '#888'
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 2
        const healthText = '+1 MAX HEALTH'
        ctx.strokeText(healthText, spacing, iconY + iconSize + labelSize * 2)
        ctx.fillText(healthText, spacing, iconY + iconSize + labelSize * 2)
        ctx.fillStyle = upgradeSelection === 1 ? '#f80' : '#888'
        const damageText = '+25% DAMAGE'
        ctx.strokeText(damageText, spacing * 2, iconY + iconSize + labelSize * 2)
        ctx.fillText(damageText, spacing * 2, iconY + iconSize + labelSize * 2)
        ctx.fillStyle = upgradeSelection === 2 ? '#0f0' : '#888'
        const abilityText = 'RANDOM ABILITY'
        ctx.strokeText(abilityText, spacing * 3, iconY + iconSize + labelSize * 2)
        ctx.fillText(abilityText, spacing * 3, iconY + iconSize + labelSize * 2)
        const descSize = Math.min(cvs.width, cvs.height) / 40
        ctx.font = `${descSize}px "Courier New", monospace`
        ctx.fillStyle = '#ccc'
        let selectedDesc = ''
        if (upgradeSelection === 0) selectedDesc = 'Increase maximum health by 1 and heal 1 HP'
        else if (upgradeSelection === 1) selectedDesc = 'Increase damage by 25%'
        else if (upgradeSelection === 2) selectedDesc = 'Gain homing or explosive seed ability'
        ctx.fillText(selectedDesc, cvs.width / 2, iconY + iconSize + labelSize * 4)
        const controlSize = Math.min(cvs.width, cvs.height) / 35
        ctx.font = `${controlSize}px "Courier New", monospace`
        ctx.fillStyle = '#aaa'
        const fadeControlOpacity = (Math.sin(titleAnimationTime * 2) + 1) / 2
        ctx.fillStyle = `rgba(170, 170, 170, ${fadeControlOpacity})`
        ctx.fillText('Use LEFT(A)/RIGHT(D) arrows to select, ENTER to confirm', cvs.width / 2, cvs.height - controlSize * 2)
        if (key.arrowleft || key.a) {
            upgradeSelection = Math.max(0, upgradeSelection - 1)
            key.arrowleft = false
            key.a = false
        }
        if (key.arrowright || key.d) {
            upgradeSelection = Math.min(2, upgradeSelection + 1)
            key.arrowright = false
            key.d = false
        }
        if (key.enter) {
            applyUpgrade(upgradeSelection)
            key.enter = false
            gameState = 'playing'
            game = true
            map.set()
            map.width += 10
            map.generate()
            hero.reset()
            map.applyLevelVisualEffects()
            screen.fade.type = 'in'
            screen.fade.a = 255
            upgradeSelection = 0
            update()
            return
        }
        requestAnimationFrame(start)
    }
}

map.generate()
addEventListener('resize', resize)
initializeInput()
resize()
start()
