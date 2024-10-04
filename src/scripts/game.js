export class Game {
    constructor (configs) {
        this.initHandler    = configs.init
        this.startHandler   = configs.start
        this.pauseHandler   = configs.pause
        this.resumeHandler  = configs.resume
        this.restartHandler = configs.restart
        this.endedHandler   = configs.ended
        this.endHandler     = configs.end
        this.saveHandler    = configs.save
        this.loadHandler    = configs.load
        this.clearDataHandler = configs.clearData
    }

    init    = () => this.initHandler()
    start   = () => this.startHandler()
    pause   = () => this.pauseHandler()
    resume  = () => this.resumeHandler()
    restart = () => this.restartHandler()
    isOver  = () => this.endedHandler()
    over  = () => this.endHandler()
    save    = () => this.saveHandler()
    load    = () => this.loadHandler()
    clearData = () => this.clearDataHandler()

}
