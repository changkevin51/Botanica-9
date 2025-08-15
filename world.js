class World {
    constructor() {
        this.set()
        
        // TESTING: (0-9, where 4 is boss level)
        const TEST_LEVEL = 0  
        
        this.level = TEST_LEVEL
        this.level_end = 10
        this.width = this.level_end + (TEST_LEVEL * 10) 
        this.change_level = false
        this.plants_on_screen = 0
        
        if (TEST_LEVEL > 0) {
            playerUpgrades.levelsCompleted = TEST_LEVEL
            playerUpgrades.maxHealth = 3
            playerUpgrades.damageMultiplier = 1
            
            if (TEST_LEVEL >= 2) {
                playerUpgrades.abilities = ['homing']
                playerUpgrades.skills.doubleJump = true
            }
            if (TEST_LEVEL >= 4) {
                playerUpgrades.abilities = ['homing', 'explosive']
                playerUpgrades.skills.dash = true
            }
        }
    }

    set() {
        this.array = []
        this.enemies = []
        this.clones = []
        this.junk = []
        this.used_power = []
        this.plants = []
        this.plant_screen = []
        this.explosions = []
        this.hearts = []
        this.junk_timer_start = 3
        this.junk_timer = this.junk_timer_start
        this.heartSpawnTimer = 600 // 10 seconds at 60 FPS
        this.heartSpawnCooldown = 0
    }

    changeLevel() {
        if (this.level >= this.level_end - 1) {
            screen.fade.type = 'out'
            const change = screen.fadeOut()
            if (change) {
                this.level ++
                playerUpgrades.levelsCompleted = Math.max(playerUpgrades.levelsCompleted, this.level)
                checkSkillUnlocks()
                this.set()
                // Don't increase width for boss level, it's set in generate()
                if (this.level !== 4) {
                    this.width += 10
                }
                map.generate()
                hero.reset()
                this.applyLevelVisualEffects()
                
                // Check if entering boss level
                if (this.level === 4) {
                    screen.addNotification('BOSS LEVEL!', 'Prepare to face the ultimate challenge!', 'boss')
                }
                
                this.change_level = false
            }
        } else {
            let shouldGetUpgrade = true
            if (gameDifficulty === 'hard') {
                shouldGetUpgrade = this.level + 1 > playerUpgrades.levelsCompleted
            }
            if (shouldGetUpgrade) {
                this.level ++
                playerUpgrades.levelsCompleted = Math.max(playerUpgrades.levelsCompleted, this.level)
                checkSkillUnlocks()
                gameState = 'upgrade'
                upgradeSelection = 0
                this.change_level = false
                game = false
            } else {
                screen.fade.type = 'out'
                const change = screen.fadeOut()
                if (change) {
                    this.level ++
                    playerUpgrades.levelsCompleted = Math.max(playerUpgrades.levelsCompleted, this.level)
                    checkSkillUnlocks()
                    this.set()
                    // Don't increase width for boss level, it's set in generate()
                    if (this.level !== 4) {
                        this.width += 10
                    }
                    map.generate()
                    hero.reset()
                    this.applyLevelVisualEffects()
                    
                    // Check if entering boss level
                    if (this.level === 4) {
                        screen.addNotification('BOSS LEVEL!', 'Prepare to face the ultimate challenge!', 'boss')
                    }
                    
                    this.change_level = false
                }
            }
        }
    }

    applyLevelVisualEffects() {
        screen.sun.g += 50
        if (screen.sun.g > 255) screen.sun.b += 50
        screen.sky.g += 20
        screen.sky.b += 50
        screen.mist.r -= 50
        screen.mist.g -= 50
        screen.mist.a -= 20
    }

    generate() {
        // Check if this is the boss level (level 4, 0-indexed)
        if (this.level === 4) {
            // Boss stage - smaller map
            this.width = 15
            
            const append_junk = x => {
                this.junk.push(
                    new Junk(
                        x + random(.1, .9, 0),
                        -this.array[x]
                    )
                )
            }
            
            for (let i = 0; i < this.width; i++) {
                this.array[i] = 3 + random(0, 2, 0) // Flatter ground
                
                if (i % 5 === 0) append_junk(i)
            }
            
            const bossX = 8 // Place boss closer to the player start position
            const bossHeight = 0.8
            const groundHeight = this.array[Math.floor(bossX)]
            const bossY = -groundHeight - bossHeight // Place boss on top of ground
            
            console.log(`Spawning boss at position (${bossX}, ${bossY}) on level ${this.level}`)
            console.log(`Boss ground height at position ${bossX}: ${groundHeight}`)
            
            this.enemies.push(
                new Boss(bossX, bossY, 0.8, 0.8) 
            )
        } else {
            // Normal level generation
            const enemy_amount = ~~((this.level_end - this.level * 3) * 0.7)
            let make_enemies = enemy_amount
            console.log(`DEBUG: Level ${this.level} enemy_amount=${enemy_amount}`)
            
            const append_junk = x => {
                this.junk.push(
                    new Junk(
                        x + random(.1, .9, 0),
                        -this.array[x]
                    )
                )
            }
            for (let i = 0; i < this.width; i ++) {
                this.array[i] = 5 + random(
                    Math.abs(Math.sin(i / 2 ^ 9) * 3),
                    Math.abs(Math.sin(i / 9 ^ 9) * 5), 0
                )
                this.junk_timer --
                if (this.junk_timer <= 0) {
                    for (let n = 0; n < this.junk_timer_start + 2; n ++) append_junk(i)
                    this.junk_timer_start = random(1, 5)
                    this.junk_timer = this.junk_timer_start
                }
                make_enemies --
                // Only spawn enemies if not in tutorial mode
                // Force deactivate tutorial on level 2+ before checking (level 2 = 3rd level user plays)
                if (tutorial.active && this.level >= 2) {
                    console.log(`DEBUG: Force deactivating tutorial on level ${this.level}`)
                    tutorial.completeTutorial()
                }
                
                if (i > 8 && !tutorial.active) {
                    if (make_enemies <= 0) {
                        console.log(`DEBUG: Creating enemy at i=${i}, level=${this.level}, make_enemies was ${make_enemies}`)
                        if (this.level == this.level_end - 1) {
                            console.log('DEBUG: Creating 2 enemies (final level)')
                            this.enemies.push(
                                new Enemy(i, -this.array[i] - .35, .35, .35)
                            )
                            this.enemies.push(
                                new Enemy(i + .5, -this.array[i] - .35, .35, .35)
                            )
                        }
                        else {
                            console.log('DEBUG: Creating 1 enemy (normal level)')
                            this.enemies.push(
                                new Enemy(i, -this.array[i] - .35, .35, .35)
                            )
                        }
                        make_enemies = enemy_amount // Reset counter
                        console.log(`DEBUG: Reset make_enemies to ${enemy_amount}, total enemies: ${this.enemies.length}`)
                    }
                }
            }
            
            console.log(`DEBUG: Level ${this.level} generation complete. Total enemies: ${this.enemies.length}`)
        }
    }

    checkIfAllEnemiesAreDead() {
        let all_dead = true
        let alive_count = 0
        this.enemies.forEach(item => {
            if (item.health >= 0) {
                all_dead = false
                alive_count++
            }
        })
        
        console.log(`DEBUG: Enemy check - Total: ${this.enemies.length}, Alive: ${alive_count}, All dead: ${all_dead}`)
        
        if (all_dead) this.change_level = true
    }

    plantsOnScreen() {
        const max_plants_on_screen = 40
        this.plant_screen = []
        this.plants.forEach(item => {
            this.plant_screen.push(item)
        })
        if (this.plant_screen.length >= max_plants_on_screen)
            for (let i = 0; i < this.plant_screen.length - max_plants_on_screen; i ++)
                this.plants[this.plants.indexOf(this.plant_screen[i])].die = true
    }

    update() {
        cam.update()
        hero.update()
        this.junk.forEach(item => {
            item.update()
        })
        this.enemies.forEach(item => {
            item.update()
        })
        this.clones.forEach(item => {
            item.update()
        })
        this.used_power.forEach(item => {
            item.update()
        })
        this.explosions.forEach(item => {
            item.update()
        })
        this.hearts.forEach(item => {
            item.update()
        })
        
        // heart spawning system
        if (this.heartSpawnCooldown > 0) {
            this.heartSpawnCooldown--
        }
        
        if (hero.health < playerUpgrades.maxHealth && this.heartSpawnCooldown <= 0 && this.hearts.length === 0) {
            // increased heart spawn rate on boss level
            const heartSpawnRate = this.level === 4 ? 0.0016 : 0.0008
            if (Math.random() < heartSpawnRate) {
                try {
                    const randomX = random(2, this.width - 2, 0)
                    const groundHeight = this.array[Math.floor(randomX)]
                    this.hearts.push(
                        new Heart(
                            randomX,
                            -groundHeight - 0.5
                        )
                    )
                    this.heartSpawnCooldown = 600
                } catch (error) {
                    console.log('Heart class not ready yet:', error)
                }
            }
        }
        
        // generate continuous junk for boss level
        if (this.level === 4 && this.junk.length < 5) {  // Reduced from 7 to 5 for faster spawning
            const randomX = random(1, this.width - 1, 0)
            const groundHeight = this.array[Math.floor(randomX)]
            this.junk.push(
                new Junk(
                    randomX,
                    -groundHeight
                )
            )
        }
        
        const colorGround = distance => {
            const light = .5 + Math.abs(distance) / 10
            return ctx.fillStyle = rgb(20 / light + 30, 20 / light, 20 / light)
        }
        this.array.forEach((item, index) => {
            colorGround(hero.x - index - .5)
            stretchRect(
                0, 0, 1.02, cvs.height, {x: index, y: -item, width: 1, height: 1}
            )
        })
        colorGround(hero.x)
        ctx.fillRect(
            -scale, 0, -cam.offset_x + scale, cvs.height,
        )
        colorGround(hero.x + hero.width - this.width)
        ctx.fillRect(
            this.width * scale - cam.offset_x, 0,
            cvs.width - cam.offset_x / scale + 1, cvs.height
        )
        this.plants.forEach(item => {
            item.update()
        })
        if (this.change_level) this.changeLevel()
        else if (gameState === 'playing' || gameState === 'tutorial') screen.fade.type = 'in'
        if (hero.health <= 0) screen.fade.type = 'over'
        if (this.level >= this.level_end && (gameState === 'playing' || gameState === 'tutorial') && !this.change_level) {
            screen.fade.type = 'win'
        }
        if (gameState === 'upgrade' && game === false) {
            game = false
        }
    }
}
