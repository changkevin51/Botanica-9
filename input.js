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
    ' ': false,
    enter: false
}

function initializeInput() {
    addEventListener('keydown', e => {
        if (e.repeat) return

        // Handle special keys
        if (e.key === ' ') {
            key.space = true
            key[' '] = true
        }
        
        if (e.key === 'Enter') {
            key.enter = true
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
        
        if (e.key === 'Enter') {
            key.enter = false
        }
        
        if (key[e.key.toLowerCase()] != undefined)
            key[e.key.toLowerCase()] = false
    })
}
