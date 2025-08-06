const key = {
    arrowup: false,
    arrowleft: false,
    arrowright: false,

    w: false,
    a: false,
    d: false,

    z: false,
    q: false,
    d: false,

    x: false,
    space: false,
    ' ': false
}

function initializeInput() {
    addEventListener('keydown', e => {
        if (e.repeat) return

        // Handle space key specially
        if (e.key === ' ') {
            key.space = true
            key[' '] = true
        }
        
        if (key[e.key.toLowerCase()] != undefined)
            key[e.key.toLowerCase()] = true
        
        if ((e.key == 'x' || e.key == ' ') && hero.health && ~~hero.power && gameState === 'playing') hero.throw()
    })
    
    addEventListener('keyup', e => {
        if (e.key === ' ') {
            key.space = false
            key[' '] = false
        }
        
        if (key[e.key.toLowerCase()] != undefined)
            key[e.key.toLowerCase()] = false
    })
}
