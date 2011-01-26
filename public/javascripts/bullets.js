var Bullet = Class.extend({
    
    constructor: function(by, power, img) {
        if(!by) return
        this.x = by.box.x
        this.y = by.box.y
        this.img = img
        this.angle = by.box.angle + by.gunBearing
        this.speed = 20
        this.direction = new Geometry.Vector(Math.round(Math.sin(by.box.angle + by.gunBearing) * this.speed), Math.round(Math.cos(by.box.angle + by.gunBearing) * this.speed))
        this.power = power
        this.by = by
        for(var i=0; i<4; i++) this.move()
        Medias.sound('fire', .25 * power).play()
    },
    
    draw: function() {
        var ctx = this.by.ctx
        var img = this.img
        var scale = this.power / 4
        var w = img.width * scale, h = img.height * scale
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.angle)
        ctx.drawImage(img, -w/2, -h/2, w, h)
        ctx.restore()        
    },
    
    destroy: function() {
        for(var i=0; i<this.by.world.bullets.length; i++) {
            if(this.by.world.bullets[i] == this) {
                this.by.world.bullets.splice(i,1)
                break
            }
        }
    },
    
    move: function() {       
        this.x += this.direction.x
        this.y -= this.direction.y
    
        // Targets
        for(var i=0; i<this.by.world.robots.length; i++) {
            var robot = this.by.world.robots[i]
            if(robot == this.by) continue
            if(robot.box.asPolygon().containsPoint(this)) {
                this.touched(robot)
                break
            }
        }
        
        // Quit the world
        if(!this.by.world.asPolygon().containsPoint(this)) {
            this.destroy()
        }
    },
    
    touched: function(target) {
        this.by.world.explosions.push(new BulletExplosion(this.by.world, this.x, this.y, this.power))
        target.velocity = 0
        target.energy -= 4 * this.power
        this.by.energy += 3 * this.power
        this.destroy()
    }
    
})