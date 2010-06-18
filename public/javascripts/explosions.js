var Explosion = Class.extend({
    
    constructor: function(world, x, y, images) {
        this.x = x
        this.y = y
        this.step = 0
        this.scale = 1
        this.world = world
        this.images = images
    },
    
    draw: function() {
        if(this.step >= this.images.length) {
            for(var i=0; i<this.world.explosions.length; i++) {
                if(this.world.explosions[i] == this) {
                    this.world.explosions.splice(i,1)
                    break
                }
            }
        } else {
            var stepImg = this.images[this.step]
            var w = stepImg.width * this.scale, h = stepImg.height * this.scale
            this.world.ctx.drawImage(stepImg, this.x - w/2, this.y - h/2, w, h)
            this.step++
        }
    }
    
})


var BulletExplosion = Explosion.extend({
    
    images: [],
    
    constructor: function(world, x, y, power) {
        if(!world) return
        this._super(world, x, y, this.images)
        this.scale = (30 * power) / (this.images.length ? this.images[0].width : 128)
        Medias.sound('hit', .25 * power).play()
    },
    
    preload: function() {
        for(var i=1; i<=17; i++) {
            this.images.push(x$.image('/assets/images/explosions/explosion1-'+i+'.png'))
        }
        return new NeedLoading(this.images, 'Bullet explosion')
    }
    
})

var RobotExplosion = Explosion.extend({
    
    images: [],

    constructor: function(world,x, y) {
        if(!world) return
        this._super(world, x, y, this.images)
        Medias.sound('explode').play()
    },
    
    preload: function() {
        for(var i=1; i<=70; i++) {
            this.images.push(x$.image('/assets/images/explosions/explosion2-'+i+'.png'))
        }
        return new NeedLoading(this.images, 'Robot explosion')
    }    
    
})