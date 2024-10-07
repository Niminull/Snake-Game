// modules
import { Screen } from './screen.js'
import { Game } from './game.js'
import { Snake, Food } from './smart-snake.js'

(function main() {


    // utils
    const select = (el, all=1) => all ? document.querySelectorAll(el): document.querySelector(el)
    const random = (min, max, invalidNumbers) => {
        const randomNumber = Math.floor( Math.random() * (max+1 - min) + min )
        return invalidNumbers && invalidNumbers.includes(randomNumber) ? random(min, max, invalidNumbers): randomNumber
    }
    const randomCoordinates = (array) => {
        const x = random(0, screen.getColsCount() - 1)
        const y = random(0, screen.getRowsCount() - 1)
        if ( array.some(i => i.x / scale === x && i.y / scale === y) )
            return randomCoordinates(array)
        return { x: x * scale, y: y * scale }
    }

    // define variables
    const scale = 50
    const fps = 10
    const canvas = document.querySelector('#canvas')

    const canvasWrapper = select('#convas__wrapper', 0)
    const width = canvasWrapper.innerWidth
    const height = canvasWrapper.innerHeight

    const screen = new Screen({ canvas, scale, fps, width, height })

    // snake game
    const configs = {
        processInterval: setInterval(() => {}), 
        snake: new Snake({
            name: 'Wiggles', 
            canvasId: canvas.id, 
            gap: 2, 
            width: scale, 
            height: scale, 
            mainColor: '#FF7700', 
            eyeColor: '#111111', 
            spiritColor: '#AAAAAa22'
        }), 
        food: new Food({
            canvasId: canvas.id, 
            color: '#EE0000', 
            outline: 15, 
            width: scale, 
            height: scale
        }), 
        ended: null, 

        init: () => {

            screen.init()
            screen.clear()
            // screen.drawGridLines()

        }, 

        start: () => {
            configs.ended = false
            // spawn snake
            configs.snake.spawn( randomCoordinates([]) )
            // spawn food
            configs.food.spawn( randomCoordinates( configs.snake.getBody() ) )
            // snake start moving to get the food
            configs.snake.moveTo(
                configs.food.getCoordinates(), 
                screen.getColsCount() * screen.getScale(), 
                screen.getRowsCount() * screen.getScale()
            )
            configs.process()
        }, 

        process: () => configs.processInterval = setInterval(() => {

            screen.clear()
            // screen.drawGridLines()

            if ( configs.snake.bitItself() ) 
                return configs.end()

            if ( configs.snake.hasGetFood( configs.food.getCoordinates() ) ) {

                configs.food.respawn(randomCoordinates( configs.snake.getBody() ))
                configs.snake.moveTo( configs.food.getCoordinates(), screen.getColsCount() * screen.getScale(), screen.getRowsCount() * screen.getScale() )
                configs.snake.grow( screen.getColsCount() * screen.getScale(), screen.getRowsCount() * screen.getScale() )

            }

            // move snake
            configs.snake.takeStep()

            // 1. draw snake's path
            configs.snake.draw('path')
            // 2. draw food
            configs.food.draw()
            // 3. draw snake
            configs.snake.draw('snake')

        }, (1000 / screen.getFPS()) ), 

        end: () => {
            configs.pause()
            alert(`${ configs.snake.name } died of its own bite, Score: ${ configs.snake.getBody().length }`)
            configs.snake.die()
            configs.restart()
            configs.ended = true
        }, 

        pause: () => {
            clearInterval(configs.processInterval)
        }, 

        resume: () => {
            if (configs.ended) 
                configs.restart()
            else configs.process()
        }, 

        restart: () => {
            configs.clearData()
            configs.start()
        }, 

        save: () => {
            const snakeInfo = configs.snake.getInfo()
            const foodInfo = configs.food.getInfo()
            localStorage.setItem('snake-game', JSON.stringify({
                snake: snakeInfo, 
                food: foodInfo
            }))
        }, 

        load: () => {
            try {
                const info = JSON.parse( localStorage.getItem('snake-game') )
                if (!info) return
                // TODO: FIX
                if ( info.snake.body.length > 20 ) {
                    configs.clearData()
                    return
                }

                configs.snake = new Snake(info.snake)
                configs.food = new Food(info.food)

            } catch (err) {
                configs.clearData()
                console.error(err)
            }
        }, 

        clearData: () => localStorage.removeItem('snake-game')

        // update: () => {}, 
    }

    // game handling
    const game = new Game(configs)
    game.init()
    game.load()
    game.start()
    // game.pause()
    // game.resume()
    // game.isOver()
    // game.restart()

    // event handlers: 
    window.addEventListener('resize', screen.resize)

    // to pause/resume the game
    let stopped = false

    window.addEventListener('keydown', e => {
        if (e.which === 32 || e.which === 27) 
            pauseHandler()
    })
    window.addEventListener('click', pauseHandler)

    // save changes
    window.addEventListener('beforeunload', e => {
        game.save()
        e.preventDefault()
        e.returnValue = ''
    })

    function pauseHandler (e) {
        if (stopped) game.resume()
        else game.pause()
        stopped = !stopped
    }

})()