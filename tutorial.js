class Tutorial {
    constructor() {
        this.active = false
        this.step = 0
        this.checklist = []
        this.completed = []
        this.currentMessage = null
        this.messageTimer = 0
        this.waitingForF = false
        this.tutorialEnemy = null
        this.originalEnemySpeed = 0
        this.blockEnemyMovement = false
        this.blockEnemyDamage = false
        this.requireChargedShotsOnly = false
        this.tutorialPlant = null
        this.fadeAlpha = 0
        this.fadeDirection = 1
        this.pauseGameLogic = false
        this.bloomWaitTimer = 0
        this.bloomWaitDuration = 120 
        this.fallbackTimer = 0
    }

    start() {
        this.active = true
        this.step = 0
        this.checklist = []
        this.completed = []
        this.pauseGameLogic = false
        this.bloomWaitTimer = 0
        this.fallbackTimer = 0
        this.setupStep()
    }

    setupStep() {
        this.checklist = []
        this.completed = []
        this.currentMessage = null
        this.messageTimer = 0
        this.waitingForF = false
        this.blockEnemyMovement = false
        this.blockEnemyDamage = false
        this.requireChargedShotsOnly = false
        this.bloomWaitTimer = 0
        this.fallbackTimer = 0

        switch(this.step) {
            case 0:
                this.checklist = ['moveLeft', 'moveRight', 'jump', 'pickupJunk', 'shootSeed']
                this.showMessage('Welcome to Botanica! Use A/D to move left/right, W or SPACE to jump. Collect trash to get energy to shoot seeds!', false, 5000)
                this.clearEnemies()
                break
            
            case 1:
                this.showMessage('Great! Seeds take time to bloom into flowers. Wait for it...', false, 3000)
                this.waitForPlantToBloom()
                break
            
            case 2:
                this.showMessage('Perfect! Enemies take damage when they step on flowers. Let me spawn an enemy for you.', false, 3000)
                this.spawnTutorialEnemy()
                break
            
            case 3:
                this.checklist = ['hitEnemyWithRegularShot']
                this.showMessage('Click and aim at the enemy to hit it with your seeds!', false, 3000)
                this.blockEnemyMovement = true
                break
            
            case 4:
                this.showMessage('Excellent! Now let me teach you about charged shots. Hold down the mouse button to charge, then release to fire!', false, 4000)
                this.checklist = ['performChargedShot']
                this.blockEnemyDamage = true
                this.requireChargedShotsOnly = true
                break
            
            case 5:
                this.showMessage('Perfect! Charged shots deal more damage and have longer range, but consume more ammo and take longer to fire. Now defeat the enemy!', false, 4000)
                this.checklist = ['finishEnemy']
                this.blockEnemyDamage = false
                this.requireChargedShotsOnly = false
                break
            
            case 6:
                this.showMessage('Congratulations! You have completed the tutorial. The game will now resume normally.', false, 3000)
                this.completeTutorial()
                break
        }
    }

    showMessage(text, requireF = false, duration = 0) {
        this.currentMessage = text
        this.waitingForF = requireF
        this.messageTimer = duration
        this.fadeAlpha = 0
        this.fadeDirection = 1
    }

    clearEnemies() {
        map.enemies = []
    }

    spawnTutorialEnemy() {
        this.clearEnemies()
        const enemyX = hero.x + 3
        const groundHeight = map.array[Math.floor(enemyX)] || 5
        this.tutorialEnemy = new Enemy(enemyX, -groundHeight - 0.35, 0.35, 0.35)
        this.tutorialEnemy.speed = 0
        this.tutorialEnemy.move_time = 999999
        map.enemies.push(this.tutorialEnemy)
    }

    waitForPlantToBloom() {
        if (map.plants.length > 0) {
            this.tutorialPlant = map.plants[map.plants.length - 1]
        }
    }

    checkStep() {
        if (!this.active) return

        switch(this.step) {
            case 0:
                if (key.a || key.arrowleft) this.markCompleted('moveLeft')
                if (key.d || key.arrowright) this.markCompleted('moveRight')
                if (key.w || key.arrowup || key.space || key.z) this.markCompleted('jump')
                if (hero.power > 0) this.markCompleted('pickupJunk')
                if (map.used_power.length > 0) this.markCompleted('shootSeed')
                break
            
            case 1:
                this.fallbackTimer++
                
                // Always try to find a plant if we don't have one yet
                if (!this.tutorialPlant && map.plants.length > 0) {
                    this.tutorialPlant = map.plants[map.plants.length - 1]
                    console.log('Tutorial: Found plant, stems:', this.tutorialPlant.stems.length, 'growing:', this.tutorialPlant.grow)
                }
                
                // Check if plant has finished growing (has multiple stems and stopped growing)
                if (this.tutorialPlant && (this.tutorialPlant.stems.length >= 3 || !this.tutorialPlant.grow)) {
                    this.bloomWaitTimer++
                    console.log('Tutorial: Plant grown, waiting...', this.bloomWaitTimer, '/', this.bloomWaitDuration)
                    if (this.bloomWaitTimer >= this.bloomWaitDuration) {
                        console.log('Tutorial: Proceeding to next step')
                        this.nextStep()
                    }
                } else if (this.fallbackTimer > 600) { // 10 seconds fallback
                    console.log('Tutorial: Fallback timer triggered, proceeding anyway')
                    this.nextStep()
                }
                break
            
            case 2:
                if (map.enemies.length > 0) {
                    this.nextStep()
                }
                break
            
            case 3:
                // Damage detection is handled in Enemy class
                break
            
            case 4:
                break
            
            case 5:
                if (this.tutorialEnemy && this.tutorialEnemy.health <= 0) {
                    this.markCompleted('finishEnemy')
                }
                break
        }

        if (this.allChecklistCompleted()) {
            this.nextStep()
        }
    }

    markCompleted(task) {
        if (!this.completed.includes(task) && this.checklist.includes(task)) {
            this.completed.push(task)
        }
    }

    allChecklistCompleted() {
        return this.checklist.length > 0 && this.checklist.every(task => this.completed.includes(task))
    }

    nextStep() {
        this.step++
        this.setupStep()
    }

    completeTutorial() {
        this.active = false
        this.pauseGameLogic = false
        this.blockEnemyMovement = false
        this.blockEnemyDamage = false
        this.requireChargedShotsOnly = false
        this.currentMessage = null
        gameState = 'playing'
        game = true
    }

    handleInput() {
        // No F key handling - tutorial progresses automatically
    }

    shouldBlockEnemyMovement() {
        return this.active && this.blockEnemyMovement
    }

    shouldBlockEnemyDamage() {
        return this.active && this.blockEnemyDamage
    }

    shouldRequireChargedShots() {
        return this.active && this.requireChargedShotsOnly
    }

    update() {
        if (!this.active) return

        this.checkStep()
        this.handleInput()

        if (this.currentMessage) {
            if (this.fadeDirection === 1) {
                this.fadeAlpha += 0.05
                if (this.fadeAlpha >= 1) {
                    this.fadeAlpha = 1
                    this.fadeDirection = 0
                }
            }

            if (!this.waitingForF && this.messageTimer > 0) {
                this.messageTimer -= 16.67
                if (this.messageTimer <= 0) {
                    this.fadeDirection = -1
                }
            }

            if (this.fadeDirection === -1) {
                this.fadeAlpha -= 0.03
                if (this.fadeAlpha <= 0) {
                    this.fadeAlpha = 0
                    this.currentMessage = null
                    this.fadeDirection = 1
                }
            }
        }

        if (this.step === 4 && charging.active && charging.chargeLevel >= 1) {
            this.markCompleted('performChargedShot')
        }
    }

    draw() {
        if (!this.active) return

        ctx.save()

        if (this.checklist.length > 0) {
            this.drawChecklist()
        }

        if (this.currentMessage) {
            ctx.globalAlpha = this.fadeAlpha

            const padding = 20
            const maxWidth = cvs.width - padding * 2
            const fontSize = Math.min(24, cvs.width / 40)
            
            ctx.font = `${fontSize}px "Courier New", monospace`
            ctx.textAlign = 'center'
            
            const lines = this.wrapText(this.currentMessage, maxWidth, ctx)
            const lineHeight = fontSize * 1.2
            const totalHeight = lines.length * lineHeight + padding * 2
            const boxHeight = totalHeight
            
            const boxY = 50
            const boxX = cvs.width / 2 - maxWidth / 2 - padding
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
            ctx.fillRect(boxX, boxY, maxWidth + padding * 2, boxHeight)
            
            ctx.strokeStyle = '#0f0'
            ctx.lineWidth = 3
            ctx.strokeRect(boxX, boxY, maxWidth + padding * 2, boxHeight)
            
            ctx.fillStyle = '#fff'
            lines.forEach((line, index) => {
                ctx.fillText(line, cvs.width / 2, boxY + padding + (index + 1) * lineHeight)
            })
        }
        
        ctx.restore()
    }

    drawChecklist() {
        const checklistX = 20
        const checklistY = cvs.height - 250 // Move up a bit more to avoid UI overlap
        const itemHeight = 25
        const fontSize = 16
        
        ctx.font = `${fontSize}px "Courier New", monospace`
        ctx.textAlign = 'left'
        
        const boxWidth = 350
        const boxHeight = this.checklist.length * itemHeight + 50
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
        ctx.fillRect(checklistX - 10, checklistY - 35, boxWidth, boxHeight)
        
        ctx.strokeStyle = '#0f0'
        ctx.lineWidth = 2
        ctx.strokeRect(checklistX - 10, checklistY - 35, boxWidth, boxHeight)
        
        ctx.fillStyle = '#0f0'
        ctx.font = `bold ${fontSize + 2}px "Courier New", monospace`
        ctx.fillText('Tutorial Progress:', checklistX, checklistY - 10)
        
        ctx.font = `${fontSize}px "Courier New", monospace`
        this.checklist.forEach((task, index) => {
            const y = checklistY + index * itemHeight + 15
            const completed = this.completed.includes(task)
            
            ctx.fillStyle = completed ? '#0f0' : '#888'
            ctx.fillText(completed ? '✓' : '○', checklistX, y)
            
            ctx.fillStyle = completed ? '#fff' : '#aaa'
            ctx.fillText(this.getTaskDescription(task), checklistX + 25, y)
        })
    }

    getTaskDescription(task) {
        const descriptions = {
            'moveLeft': 'Move left (A)',
            'moveRight': 'Move right (D)',
            'jump': 'Jump (W/SPACE)',
            'pickupJunk': 'Pick up junk for ammo',
            'shootSeed': 'Shoot a seed (click)',
            'hitEnemyWithRegularShot': 'Hit enemy with seed',
            'performChargedShot': 'Perform charged shot',
            'finishEnemy': 'Defeat the enemy'
        }
        return descriptions[task] || task
    }

    wrapText(text, maxWidth, context) {
        const words = text.split(' ')
        const lines = []
        let currentLine = words[0]

        for (let i = 1; i < words.length; i++) {
            const word = words[i]
            const width = context.measureText(currentLine + ' ' + word).width
            if (width < maxWidth) {
                currentLine += ' ' + word
            } else {
                lines.push(currentLine)
                currentLine = word
            }
        }
        lines.push(currentLine)
        return lines
    }
}
