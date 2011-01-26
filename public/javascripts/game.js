var parisjs = {
    roundLength: 3 * 60,
    winners: [],
    lastTime: 0,
    loadRobots: function(){
        // Fetch the bots, retrieve urls...
        $.getJSON("/robots/list/8", function(urls){
            urls = urls.concat([robotURL({name: 'tracker'}), robotURL({name: 'crazy'}), robotURL({name: 'walls'})]);
            var bots = $.map(urls, function(url){
                return new RobotDescription(url);
            });
            game.reloadAll('world', bots, function() { });
        });
    },
    startRound: function(){
        this.startTime = new Date();
        this.running = true;
        $("#timetime").show()
    },
    stopRound: function(bots){
        if (!this.running) return;
        this.running = false;
        var survivors = $.map(bots, function(bot){ return {"name": bot.name, "energy": bot.energy } }),
            winners = survivors.sort(function(a,b){return a.energy<b.energy;});//_.sortBy(survivors, function(bot){ return bot.energy });

        this.winners.push(winners[0])
        alert("winner " + winners[0].name + "\n\n" + _.pluck(winners,"energy"));
        $("#timetime").hide()
    },
    tick: function(){
        var remain = ~~(this.roundLength - ((new Date() - this.startTime) / 1000));
        if(remain != this.lastTime){
            this.lastTime = remain;
            $("#timetime").text(remain);
        }
        if(remain % 10 === 0){
            this.oneDown(game.world.robots);
        }
    },
    isRoundOver: function(){
        var finished = (new Date() - this.startTime) / 1000 > this.roundLength;
        if(!finished){
            return false;
        }
        return true;
    },
    oneDown: function(bots){
        var survivors = $.map(bots, function(bot){ return bot.name + ":" + bot.energy; }),
            winners = _.sortBy(survivors, function(bot){ return bot.energy }).slice(0,5);
        $("#players").html("");
        $.each(winners, function(winner){
            $("<li></li>").appendTo("#players").text(winner.name);
        });
    }
};

var Game = Class.extend({
    
    constructor: function(el, robots, readyCallback, timeoutCallback) {
        var items = [].concat([new BulletExplosion().preload(), new RobotExplosion().preload()]).concat(robots)
        var game = this
        new AsyncLoader(items, 5000, 
            function() {
                game.world = new World(document.getElementById(el), robots)
                game.world.init()
                if(readyCallback) readyCallback()
            },
            timeoutCallback || function(notLoaded) {
                alert('TIMEOUT -> ' + notLoaded.toString())
            }
        )
    },
    
    start: function() {
        this.world.start()
    },
    
    stop: function() {
        this.world.stop()
    },
    
    repaint: function() {
        this.world.draw()
    },
    
    restart: function() {
        this.world.stop()
        this.world.init()
    },
    
    reloadAll: function(el, robots, readyCallback, timeoutCallback){
        var game = this
        game.stop();
        new AsyncLoader(robots, 5000, 
            function() {    
                game.world = new World(document.getElementById(el), robots)
                game.world.init()
                if(readyCallback) readyCallback()
            },
            timeoutCallback || function(notLoaded) {
                alert('TIMEOUT -> ' + notLoaded.toString())
            }
        )
    },
    
    reload: function(robot) {
        this.world.stop()
        for(var i=0; i<this.world.robots.length; i++) {
            var robotP = this.world.robots[i]
            if(robotP.description == robot) {
                robotP.reloadAI()
            }
        }
        this.world.start()
    }
    
})

var World = Class.extend({
    
    standardSize: 36,
    
    constructor: function(el, robotDescriptions) {
        
        // Get canvas
        this.el = el
        this.ctx = this.el.getContext('2d')
        this.w = this.el.width
        this.h = this.el.height
        this.robotSize = 36
        this.robotDescriptions = robotDescriptions
        this.robots = []
    },
    
    randomPosition: function() {
        var x,y,h
        var search = true
        while(search) {
            x = Math.floor(Math.random() * (this.w - 2 * this.robotSize)) + this.robotSize
            y = Math.floor(Math.random() * (this.h - 2 * this.robotSize)) + this.robotSize
            h = Math.random() * 2 * Math.PI
            var box = new Geometry.Box(x, y, this.robotSize, h).asPolygon()
            if(this.asPolygon().contains(box)) {
                search = false
                for(var i=0; i<this.robots.length; i++) {
                    if(this.robots[i].box.asPolygon().intersects(box)) {
                        search = true
                        break
                    }
                }
            }
        }
        return {x:x, y:y, h:h}
    },
    
    init: function() {
        // Init robots
        this.robots = []
        var x = 50
        for(var i=0; i<this.robotDescriptions.length; i++) {
            var position = this.randomPosition()
            this.robots.push(new RobotProxy(this.robotDescriptions[i], this, position.x, position.y, position.h))
        }
        
        // Bullets
        this.bullets = []
        this.explosions = []
                    
        // Frame timer
        this.timer = new FrameTimer(48)
        this.timer.tick()
        
        // Inited
        this.draw()
    },
    
    start: function() {
        if(!parisjs.running)parisjs.startRound();
        this.liveTimer = setInterval(x$.bind(this.live, this), 5)
    },
    
    stop: function() {
        clearInterval(this.liveTimer)
    },
    
    asPolygon: function() {
        return new Geometry.Polygon([{x:0, y:0}, {x:this.w, y:0}, {x:this.w, y:this.h}, {x:0, y:this.h}])
    },
    
    live: function() {
        if( parisjs.isRoundOver() ){
            parisjs.stopRound(this.robots);
            return false;
        }
        if(this.timer.isTime()) {
            this.timer.tick()
                        
            var world = this
            
            // Round end
            var winner
            if(this.robots.length == 1) {
                winner = this.robots[0];
                parisjs.stopRound(this.robots)
            }
            
            // Move robot
            x$.each(this.robots, function() {
                this.live()
                if(this == winner) {
                    this.dance()
                } else {
                    this.play()
                }
                this.command = {}
            })
            
            parisjs.tick();
            
            this.draw()
            
            // Move bullet
            x$.each([].concat(this.bullets), function() {
                this.move()
            })
            
        }
    },
    
    draw: function() {
        this.ctx.clearRect(0, 0, this.w, this.h)
        x$.each(this.robots, function() {
            this.draw()
        })
        x$.each([].concat(this.bullets), function() {
            this.draw()
        })
        x$.each([].concat(this.explosions), function() {
            this.draw()
        })
    },
    
    asJSON: function() {
        return {
            w: this.w,
            h: this.h,
            turn: this.timer.turn
        }
    }
    
})

var RobotProxy = Class.extend({
    
    constructor: function(description, world, x, y, heading) {
        this.name = description.name
        this.world = world
        this.ctx = world.ctx
        this.box = new Geometry.Box(x || world.w/2, y || world.h/2, world.robotSize, heading || 0)
        this.velocity = 0
        this.description = description
        this.reloadAI()
        this.gunBearing = 0
        this.radarBearing = 0
        this.gunHeat = 3
        this.energy = 100
        this.lastRadarHeading = this.box.angle
        this.images = description.images
        this.command = {
            acceleration: 0,
            rotation: 0,
            gunRotation: 0
        }
    },
    
    reloadAI: function() {
        if(this.worker) this.worker.terminate()
        this.worker = new Worker(this.description.script)
        this.worker.onmessage = x$.bind(this.onmessage, this)
    },
    
    onmessage: function(event) {
      var limit = 100; // limit message per second
      var now = new Date().getTime();
      if(!this.spamLastDate) this.spamLastDate = now;
      if(!this.spamMessageCount) this.spamMessageCount = 0;
      if(now-this.spamLastDate > 1000) {
        if(this.spamMessageCount/((now - this.spamLastDate)/1000) > limit) {
          this.worker.terminate(); // kill spammers
        }
        this.spamLastDate = now;
        this.spamMessageCount = 0;
      }
      ++ this.spamMessageCount;
      
      try {
        var message = JSON.parse(event.data);
        switch(message.type) {

            case 'command':
                var cmd = message.data
                this.command.acceleration = cmd.acceleration || 0
                this.command.rotation = cmd.rotation || 0
                this.command.gunRotation = cmd.gunRotation || 0
                this.command.radarRotation = cmd.radarRotation || 0
                this.command.fire = Math.abs(cmd.fire) || 0
                break
                
            case 'debug':
                console.log('DEBUG('+this.name+'): ' + message.data)

        }
      }
      catch(e) {
        
      }
    },
    
    destroy: function() {
        parisjs.oneDown(this.world.robots);
        for(var i=0; i<this.world.robots.length; i++) {
            if(this.world.robots[i] == this) {
                this.world.robots.splice(i,1)
                break
            }
        }
        this.world.explosions.push(new RobotExplosion(this.world, this.box.x, this.box.y))
    },
    
    draw: function() {
    
        this.ctx.save()
        this.ctx.translate(this.box.x, this.box.y)
        
        var scale = this.box.size/this.world.standardSize
        
        // Draw body
        this.ctx.rotate(this.box.angle)
        this.ctx.drawImage(this.images.body, -(this.images.body.width*scale)/2, -(this.images.body.height*scale)/2, this.images.body.width * scale, this.images.body.height * scale)
        
        // Draw turret
        this.ctx.rotate(this.gunBearing)
        this.ctx.drawImage(this.images.turret, -(this.images.turret.width*scale)/2, -(this.images.turret.height*scale)/2, this.images.turret.width * scale, this.images.turret.height * scale)
        
        // Draw radar
        this.ctx.rotate(this.radarBearing - this.radarBearing%(Math.PI/8))
        this.ctx.drawImage(this.images.radar, -(this.images.radar.width*scale)/2, -(this.images.radar.height*scale)/2, this.images.radar.width * scale, this.images.radar.height * scale)
        
        this.ctx.restore()
        
        // Draw text?
        if(Configuration.drawText) {
            var status = this.name + ': ' + this.energy.toFixed(1)
            this.ctx.fillStyle = '#ffffff'
            this.ctx.font = "17px Arial";
            var w = this.ctx.measureText(status).width
            this.ctx.fillText(status, this.box.x - w/2, this.box.y + (this.box.size * (this.box.y > this.world.h - this.box.size ? -1 : 1)) )
        }
        
        // Draw scan area?
        if(Configuration.scanVisible && this.scanArea) {
            this._drawPolygon(this.scanArea, 'rgba(255,0,0,.1)')
        }
        
        // Draw corners
        if(Configuration.drawCorners) {
            this._drawPoints(this.box.corners(), 'cyan')
        }
    },
    
    _drawPoints: function(points, color) {
        var ctx = this.ctx
        ctx.fillStyle = color
        x$.each(points, function() {
            ctx.beginPath()
            ctx.arc(this.x, this.y, 2, 0, Math.PI*2, true)
            ctx.closePath()
            ctx.fill()
        })
    },
    
    _drawPolygon: function(polygon, color) {
        var ctx = this.ctx
        ctx.fillStyle = color
        ctx.beginPath();
        ctx.moveTo(polygon.points[0].x, polygon.points[0].y)
        for(var i=1; i<polygon.points.length; i++) {
            ctx.lineTo(polygon.points[i].x, polygon.points[i].y)
        }
        ctx.closePath();
        ctx.fill()
    },
    
    play: function() {
        var events = {
            hitWall: this.hitWall,
            hitRobot: this.hitRobot && true,
            scanned: []
        }
        for(var i=0; i<this.scanned.length; i++) {
            var other = this.scanned[i]
            events.scanned.push({
                name: other.name,
                distance: Geometry.distance(this.box, other.box),
                velocity: other.velocity,
                heading: Geometry.toDegree(other.box.angle),
                bearing: Geometry.toDegree(Geometry.normalizeAngle(Math.atan2(other.box.y - this.box.y, other.box.x - this.box.x) + Math.PI/2 - this.box.angle)) 
            })
        }
        this.worker.postMessage(JSON.stringify({
            type: 'play',
            data: {
                robot: this.asJSON(),
                world: this.world.asJSON(),
                events: events
            }
        }))
    },
    
    asJSON: function() {
        return {
            name: this.name,
            x: this.box.x,
            y: this.box.y,
            heading: Geometry.toDegree(this.box.angle),
            velocity: this.velocity,
            gunBearing: Geometry.toDegree(this.gunBearing),
            energy: this.energy
        }
    },
    
    dance: function() {
        this.worker.postMessage(JSON.stringify({
            type: 'dance',
            data: {
                robot: this.asJSON(),
                world: this.world.asJSON(),
                events: {
                    win: true
                }
            }
        }))
    },
    
    live: function() {         
        this.hitWall = undefined
        this.hitRobot = undefined
        this.scanned = []
        
        // Gun heat
        this.gunHeat -= .1
        if(this.gunHeat < 0) this.gunHeat = 0
        
        // Fire
        if(this.gunHeat == 0 && this.command.fire) {
            if(this.command.fire > 4) this.command.fire = 4
            if(this.command.fire < 1) this.command.fire = 1
            this.world.bullets.push(new Bullet(this, this.command.fire, this.images.bullet))
            this.gunHeat = 2 * this.command.fire
            this.energy -= this.command.fire
        }
        
        // Check commands
        this.command.acceleration = Math.round(this.command.acceleration || 0)
        if(this.command.acceleration > 1) this.command.acceleration = 1
        if(this.command.acceleration < -1) this.command.acceleration = -1
        
        this.command.rotation = Math.round(this.command.rotation || 0)
        if(this.command.rotation > 1) this.command.rotation = 1
        if(this.command.rotation < -1) this.command.rotation = -1
        
        this.command.gunRotation = Math.round(this.command.gunRotation || 0)
        if(this.command.gunRotation > 4) this.command.gunRotation = 4
        if(this.command.gunRotation < -4) this.command.gunRotation = -4
        
        this.command.radarRotation = Math.round(this.command.radarRotation || 0)
        if(this.command.radarRotation > 15) this.command.radarRotation = 15
        if(this.command.radarRotation < -15) this.command.radarRotation = -15
        
        // Accelerate
        if(this.command.acceleration) {
            this.velocity += this.command.acceleration
        } else if(this.velocity != 0 ){
            this.velocity += this.velocity > 0 ? -1 : 1
        }

        // Rotate
        this.box.angle += this.command.rotation * (Math.PI/180) * 2
        
        // Turn gun
        this.gunBearing += this.command.gunRotation * (Math.PI/180)
        
        // Turn radar
        this.radarBearing += this.command.radarRotation * (Math.PI/180)
        
        // Ensure that all is good
        this.normalize()

        // Now move
        if(this.velocity != 0) {
            this.move()
        }
        
        // Scan
        this.scanned = this.scan()
    
        // Destroy?
        if(this.energy <=0) {
            this.destroy()
        }
        
        // Update
        this.description.update(this.asJSON())
    },
    
    normalize: function() {
        var max = 4 // max speed
        if(this.velocity > max) this.velocity = max  
        if(this.velocity < -max) this.velocity = -max       
        this.box.angle = Geometry.normalizeAngle(this.box.angle)
        this.gunBearing = Geometry.normalizeAngle(this.gunBearing)
        var d = Geometry.toDegree(this.box.angle)
        if(d%2) {
            d--
            this.box.angle = Geometry.toRadian(d)
        }
        if(this.box.y <= this.box.size/2) this.box.y++
        if(this.box.y >= this.world.h - this.box.size/2) this.box.y--
        if(this.box.x >= this.world.w - this.box.size/2) this.box.x--
        if(this.box.x <= this.box.size/2) this.box.x++
    },
    
    //
    
    scan: function() {
        var radarHeading = this.box.angle + this.gunBearing + this.radarBearing
        var x1 = Math.round(Math.cos(Math.PI/2 - this.lastRadarHeading) * 1200 + this.box.x)
        var y1 = -Math.round(Math.sin(Math.PI/2 - this.lastRadarHeading) * 1200 - this.box.y)
        var x2 = Math.round(Math.cos(Math.PI/2 - radarHeading) * 1200 + this.box.x)
        var y2 = -Math.round(Math.sin(Math.PI/2 - radarHeading) * 1200 - this.box.y)
        this.lastRadarHeading = radarHeading
        
        var scanned = []
        this.scanArea = new Geometry.Polygon([{x:this.box.x, y:this.box.y}, {x:x1, y:y1}, {x:x2, y:y2}])
        for(var i=0; i<this.world.robots.length; i++) {
            var other = this.world.robots[i]
            if(this == other) {
                continue
            }
            if(this.scanArea.intersects(other.box.asPolygon())) {
                scanned.push(other)
            }
        }
        
        return scanned
    },
    
    detectWallCollision: function() {
        var moved = this.box.moveGhost(this.velocity)
        return !this.world.asPolygon().contains(moved.asPolygon())
    },
    
    detectRobotCollision: function() {
        for(var i=0; i<this.world.robots.length; i++) {
            var other = this.world.robots[i]            
            if(this == other) continue   
               
            var moved = this.box.moveGhost(this.velocity)
            var otherMoved = other.box.moveGhost(other.velocity) 
            // TODO: optimize by trying the circle-circle intersection       
            if(moved.asPolygon().intersects(otherMoved.asPolygon())) {
                return other
            }            
        }
    },
    
    move: function() {
        var wall,other
        if(wall = this.detectWallCollision()) {
            this.velocity = 0
            this.hitWall = wall
            var damage = Math.abs(Math.abs(this.velocity) * 0.5 - 1)
            if(damage<0) damage = 0
            this.energy -= damage
        } else if(other = this.detectRobotCollision()){
            this.velocity = 0
            other.velocity = 0  
            this.normalize()
            this.hitRobot = other
            this.energy -= .2 * this.velocity
            other.energy -= .2 * other.velocity
        } else {
            this.box.move(this.velocity)    
        }
    }
    
})

 
