importScripts('oo.js');
importScripts('utils.js');

var Robot = Class.extend({
    
    constructor: function() {
        onmessage = x$.bind(this._onmessage, this)
    },
    
    // ~~~ Private
    
    _onmessage: function(event) {
        var message = JSON.parse(event.data)
        switch(message.type) {

            case 'play':
                this._play(message.data.robot, message.data.world, message.data.events)
                break
                
            case 'dance':
                this._play(message.data.robot, message.data.world, message.data.events, true)
                break

        }
    },
    
    _play: function(robot, world, events, dance) {
        this.command = {
            acceleration: 0,
            rotation: 0,
            gunRotation: 0,
            radarRotation: 0,
            fire: 0
        }
        if(this.play || this.dance) {
            this.x = robot.x
            this.y = robot.y
            this.heading = robot.heading
            this.velocity = robot.velocity
            this.gunBearing = robot.gunBearing
            this.world = world
            this.energy = robot.energy
            
            // Events
            if(events.hitWall && this.onHitWall) {
                this.onHitWall(events.hitWall)
            } 
            if(events.hitRobot && this.onHitRobot) {
                this.onHitRobot(events.hitRobot)
            }
            if(this.onRobotScanned && events.scanned) {
                for(var i=0; i<events.scanned.length; i++) {
                    this.onRobotScanned(events.scanned[i])
                }
            }
            if(events.win && this.onWin) {
                this.onWin()
            }
            
            if(dance && this.dance) {
                this.dance(world.turn)
            } 
            
            if(!dance && this.play) {
                this.play(world.turn)
            }
        }
        postMessage(JSON.stringify({
            type: 'command',
            data: this.command
        }))
    },
    
    // Default
    
    dance: function() {
        this.turnRight()
    },
    
    // ~~~ Public
    
    debug: function(msg) {
        postMessage(JSON.stringify({
            type: 'debug',
            data: msg
        }))
    },
    
    ahead: function() {
        this.command.acceleration = 1
    },
    
    back: function() {
        this.command.acceleration = -1
    },
    
    turnRight: function() {
        this.command.rotation = 1
    },
    
    turnLeft: function() {
        this.command.rotation = -1
    },
    
    turnGunRight: function(v) {
        this.command.gunRotation = v || 1
    },
    
    turnGunLeft: function(v) {
        this.command.gunRotation = -v || -1
    },
    
    turnGun: function(v) {
        this.command.gunRotation = v || 1
    },
    
    turnRadarRight: function(v) {
        this.command.radarRotation = v || 1
    },
    
    turnRadarLeft: function(v) {
        this.command.radarRotation = -v || -1
    },
    
    turnRadar: function(v) {
        this.command.radarRotation = v || 1
    },
    
    fire: function(p) {
        this.command.fire = p || 1
    }
    
})



