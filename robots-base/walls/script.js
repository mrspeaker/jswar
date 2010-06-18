importScripts('robot.js');

var WallsRobot = Robot.extend({
    
    state: 'findNorth',
    
    play: function(turn) {
        
        // Ensure gun at our right
        if(this.gunBearing != 90) {
            this.turnGunRight(2)
        }
        
        this.turnRadar( (turn%2 ? -1 : 1) * 15 )
        
        switch(this.state) {
            
            case 'findNorth':
                if(this.heading != 0) {
                    this.turnRight()
                } else {
                    this.state = 'move'
                }
                break
                
            case 'move':
                this.ahead()
                break
                
            case 'turn':
                if(this.heading != this.turnTo) {
                    this.turnRight()
                } else {
                    this.state = 'move'
                }
                break
            
        }

    },
    
    onHitWall: function(wall) {
        this.turnTo = this.heading + 90
        if(this.turnTo >= 360) this.turnTo = this.turnTo - 360
        this.state = 'turn'
    },
    
    onHitRobot: function(robot) {
        this.state = 'findNorth'
    },
    
    onRobotScanned: function(enemy) {
        if(enemy.bearing - this.gunBearing == 0) {
            this.fire(3)            
        }
    },
    
    dance: function() {
        this.turnLeft()
        this.turnGunRight(4)
        this.turnRadarLeft(15)
    }
    
})

new WallsRobot()



