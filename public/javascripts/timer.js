var FrameTimer = Class.extend({
    
    turn: 0,
    
    constructor: function(frames) {
        this._frames = frames
        this._lastTick = (new Date()).getTime()
    },
    
    isTime: function() {
        return (new Date()).getTime() - this._lastTick >= (1000 / this._frames)
    },
 
    tick: function() {
        var currentTick = (new Date()).getTime()
        this._frameSpacing = currentTick - this._lastTick
        this._lastTick = currentTick
        this.turn++
    }

})
