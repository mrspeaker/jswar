var Configuration = {
    
    sound: false,
    scanVisible: false,
    drawCorners: false,
    drawText: false
    
}

var RobotDescription = Class.extend({
    
    constructor: function(url, callback) {
        $.getJSON(url, x$.bind(this.configure, this))
    },
    
    configure: function(data) {
        this.name = data.name
        this.script = data.script
        this.images = {
            body: Medias.image(data.body),
            turret: Medias.image(data.turret),
            radar: Medias.image(data.radar),
            bullet: Medias.image(data.bullet),
        }
    },
    
    isLoaded: function() {
        return this.name
    },
    
    toString: function() {
        return 'Robot(' + this.name + ')'
    },
    
    update: function(state) {
        if(this.callback) this.callback(state)
    }
    
})