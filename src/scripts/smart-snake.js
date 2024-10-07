export class Snake {

    constructor (object) {
        this.canvasId = object.canvasId
        const canvas = document.getElementById(this.canvasId)
        this.ctx    = canvas.getContext('2d')
        this.gap    = object.gap
        this.color  = object.mainColor
        this.eyeColor = object.eyeColor
        this.spiritColor = object.spiritColor

        this.name   = object.name
        this.width  = object.width
        this.height = object.height

        this.body   = object.body || []
        this.cloneBody = []
        this.lastDirection = null
    }

    spawn = (coordinates) => {
        this.body.push({ x: coordinates.x, y: coordinates.y })
    }

    draw = (string) => {
        if (string === 'snake') {
            this.ctx.fillStyle = this.color
            this.ctx.beginPath()
            this.drawPart(this.body, 0, 4, true)
            this.ctx.fill()

            this.ctx.beginPath()
            this.ctx.fillStyle = this.eyeColor // snake eyes
            this.drawEyes(this.body[0], 9, 2)
            this.ctx.fill()
        } else if (string === 'path') {
            this.ctx.fillStyle = this.spiritColor
            this.ctx.beginPath()
            this.drawPart(this.cloneBody, 0, 0, false)
            this.ctx.fill()
        } else throw new Error('Invalid input, valid inputs are "snake" / "path"')
    }

    drawPart = (body, index, roundness, _gap) => {
        const part = body[index++]
        if (!part) return
        const l = 4
        const gap = _gap && index < l ? (this.gap * index)**1.05: _gap && index >= l ? (this.gap * 4)**1.05: this.gap
        this.ctx.roundRect(
            part.x + gap/2, 
            part.y + gap/2, 
            this.width - gap, 
            this.height - gap, 
            roundness
        )
        if (index < body.length)
            return this.drawPart(body, index, roundness, _gap)
        return body
    }

    drawEyes = (head, size, roundness) => {
        const { x, y, direction } = head
        let rightEye = {}, leftEye = {}
        switch ( direction ) {
            case 'left': {
                leftEye.x = x + this.width * 1/3
                rightEye.x = x + this.width * 1/3
                leftEye.y = y + this.height * 2/3
                rightEye.y = y + this.height * 1/3
                break;
            }
            case 'up': {
                leftEye.x = x + this.width * 1/3
                rightEye.x = x + this.width * 2/3
                leftEye.y = y + this.height * 1/3
                rightEye.y = y + this.height * 1/3
                break;
            }
            case 'right': {
                leftEye.x = x + this.width * 2/3
                rightEye.x = x + this.width * 2/3
                leftEye.y = y + this.height * 1/3
                rightEye.y = y + this.height * 2/3
                break;
            }
            case 'down': {
                leftEye.x = x + this.width * 2/3
                rightEye.x = x + this.width * 1/3
                leftEye.y = y + this.height * 2/3
                rightEye.y = y + this.height * 2/3
                break;
            }
            default:
                break;
        }
        this.ctx.roundRect(
            leftEye.x - size/2, 
            leftEye.y - size/2, 
            size, 
            size, 
            roundness
        )
        this.ctx.roundRect(
            rightEye.x - size/2, 
            rightEye.y - size/2, 
            size, 
            size, 
            roundness
        )
    }

    moveTo = (coordinates, screenWidth, screenHeight) => {
        this.cloneBody.push(this.body[0])
        this.choosePath(coordinates.x, coordinates.y, screenWidth, screenHeight)
    }

    choosePath = (x, y, screenWidth, screenHeight) => {
        const head = this.cloneBody[0]
        let newHead = null

        // Determine the direction to move
        let direction = 
            head.x < x ? 'right': 
            head.x > x ? 'left': 
            head.y < y ? 'down': 
            head.y > y ? 'up': 
            null

        if (!direction) return

        if ( this.isBadDirection(head, direction) ) {

            // get bad directions
            const directions = ['left', 'up', 'right', 'down']
            const badDirections = [direction]
            for (let i = 0; i < directions.length; i++) 
                if ( !badDirections.includes(direction[i]) && this.isBadDirection(head, directions[i]) ) 
                    badDirections.push(directions[i])

            // changes direction
            if ( badDirections.length < 4 )
                direction = this.changeDirection(badDirections)

            // checks if the direction is valid or not, and if it's invalid then changes it to another
            // it's just to make sure the snake doesn't choose an invalid direction when it has no way to move
            if ( this.isInvalidDirection(direction) )
                direction = this.changeDirection(direction)

        }

        //* apply direction
        switch (direction) {
            case 'right':
                newHead = { x: head.x + this.width, y: head.y, direction };
                break;
            case 'left':
                newHead = { x: head.x - this.width, y: head.y, direction };
                break;
            case 'down':
                newHead = { x: head.x, y: head.y + this.height, direction };
                break;
            case 'up':
                newHead = { x: head.x, y: head.y - this.height, direction };
                break;
            default:
                return;
        }

        this.lastDirection = direction

        newHead = this.reEnter(newHead, screenWidth, screenHeight)

        this.cloneBody.unshift(newHead)
        this.choosePath(x, y, screenWidth, screenHeight)

    }

    // TODO: FIX the exceeded stack problem
    isBadDirection = (head, direction) => 
        ( direction === 'right' && this.body.some(part => part.x === this.reEnter(head.x + this.width) && part.y === head.y) ) || 
        ( direction === 'left'  && this.body.some(part => part.x === this.reEnter(head.x - this.width) && part.y === head.y) ) || 
        ( direction === 'down'  && this.body.some(part => part.y === this.reEnter(head.y + this.height) && part.x === head.x) ) || 
        ( direction === 'up'    && this.body.some(part => part.y === this.reEnter(head.y - this.height) && part.x === head.x) ) || 
        ( this.isInvalidDirection(direction) ) ? 
        true: false

    isInvalidDirection = (direction) => 
        ( direction === 'right' && this.lastDirection === 'left' ) ||
        ( direction === 'left' && this.lastDirection === 'right' ) ||
        ( direction === 'down' && this.lastDirection === 'up' ) ||
        ( direction === 'up' && this.lastDirection === 'down' )

    changeDirection = (dirs) => {
        let directions = ['left', 'up', 'right', 'down']
        if (Array.isArray(dirs))
            dirs.forEach( direction => directions.splice( directions.indexOf(direction), 1 ) )
        else directions.splice( directions.indexOf(dirs), 1 )
        return directions[ ~~( Math.random() * directions.length ) ]
    }

    reEnter = (bodyPart, screenWidth, screenHeight) => {
        let part = bodyPart
        if (part.x > screenWidth - this.width) part.x = 0
        else if (part.x < 0) part.x = screenWidth - this.width
        else if (part.y > screenHeight - this.height) part.y = 0
        else if (part.y < 0) part.y = screenHeight - this.height
        return part
    }

    takeStep = () => {
        const newHead = this.cloneBody[ this.cloneBody.length-1 ]
        if (!newHead) return
        this.move(newHead)
        this.cloneBody.pop()
    }

    move = (newHead) => this.body = this.body.map((currentPart, index, array) => index ? array[ index - 1 ]: newHead)

    hasGetFood = (foodCoordinates) => {
        const head = this.body[0]
        if (head.x === foodCoordinates.x && head.y === foodCoordinates.y) return true
        return false
    }

    grow = (screenWidth, screenHeight) => {
        const lastPart = this.body[this.body.length - 1]
        let newPart
        switch (lastPart.direction) {
            case 'right': { newPart = { x: lastPart.x - this.width, y: lastPart.y, direction: lastPart.direction } }
                break
            case 'left': { newPart  = { x: lastPart.x + this.width, y: lastPart.y, direction: lastPart.direction } }
                break
            case 'up': { newPart    = { x: lastPart.x, y: lastPart.y + this.height, direction: lastPart.direction } }
                break
            case 'down': { newPart  = { x: lastPart.x, y: lastPart.y - this.height, direction: lastPart.direction } }
                break
            default:
                return
        }
        this.body.push(newPart)
    }

    bitItself = () => this.bite(this.body, 2)

    bite = (body, index) => {
        const head = this.body[0]
        const part = this.body[index]
        if (!part) 
            return false
        if (head.x === part.x && head.y === part.y) 
            return true
        if (index+1 < body.length) 
            return this.bite(body, index+1)
        return false
    }

    die = () => {
        this.body   = []
        this.cloneBody = []
    }

    getBody = () => this.body

    getInfo = () => ({
        name: this.name, 
        canvasId: this.canvasId, 
        gap: this.gap, 
        width: this.width, 
        height: this.height, 
        mainColor: this.color, 
        eyeColor: this.eyeColor, 
        spiritColor: this.spiritColor, 
        body: this.body
    })

}

export class Food {

    constructor (object) {
        const canvas = document.getElementById(object.canvasId)
        this.canvasId = object.canvasId
        this.ctx = canvas.getContext('2d')
        this.color = object.color
        this.outline = object.outline

        this.width = object.width
        this.height = object.height

        this.coordinates = {
            x: object.coordinates ? object.coordinates.x: null, 
            y: object.coordinates ? object.coordinates.y: null
        }
        
        this.flag = true
    }

    spawn = (coordinates) => {
        this.coordinates = { x: coordinates.x, y: coordinates.y }
        if (this.flag) 
            this.coordinates = { x: this.coordinates.x,  y: this.coordinates.y }
        this.flag = false
    }

    respawn = (coordinates) => this.spawn(coordinates)

    draw = () => {                
        this.ctx.fillStyle = this.color
        this.ctx.beginPath()
        this.ctx.roundRect(
            this.coordinates.x + this.outline/2, 
            this.coordinates.y + this.outline/2, 
            this.width - this.outline, 
            this.height - this.outline, 
            this.width
        )
        this.ctx.fill()
    }

    getCoordinates = () => this.coordinates

    getInfo = () => ({
        canvasId: this.canvasId, 
        color:  this.color, 
        outline:this.outline, 
        width:  this.width, 
        height: this.height, 
        coordinates: this.coordinates
    })

}
