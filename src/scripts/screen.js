export class Screen {

    constructor (object) {
        this.canvas     = object.canvas
        this.scale      = object.scale
        this.fps        = object.fps
        this.width      = object.width || window.innerWidth
        this.height     = object.height || window.innerHeight
        this.ctx;
        this.rows;
        this.columns;
    }

    init = () => {
        let width = 0, height = 0
        width = this.width - this.width % this.scale
        height = this.height - this.height % this.scale
        this.ctx = this.canvas.getContext('2d')
        this.ctx.lineWidth = 2

        this.canvas.width = width
        this.canvas.height = height

        this.columns = this.canvas.width / this.scale
        this.rows = this.canvas.height / this.scale
    }

    resize = () => this.init()

    drawGridLines = (width, color) => {
        const w = width || 2
        const drawColumns = (start, end) => 
            this.ctx.fillRect( start - w / 2, 0, w, this.canvas.height) || ( start < end && drawColumns( start+this.scale, end ) )
        const drawRows = (start, end) => 
            this.ctx.fillRect( 0, start - w / 2, this.canvas.width, w) || ( start < end && drawRows( start+this.scale, end ) )

        this.ctx.fillStyle = color || '#010101'
        drawColumns(0, this.canvas.width)
        drawRows(0, this.canvas.height)
    }

    clear = () => this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    getFPS = () => this.fps
    getScale = () => this.scale
    getCanvas = () => this.canvas
    getRowsCount = () => this.rows
    getColsCount = () => this.columns

}
