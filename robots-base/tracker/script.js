importScripts('robot.js');

var TrackerRobot = Robot.extend({
    
    state: 'search',
    direction: 'ahead',
    
    play: function(turn) {
                        
        if(this.direction == 'ahead') {
            this.ahead()
        } else {
            this.back()
        }
        
        switch(this.state) {
            
            case 'search':
                this.turnGunRight(4)
                //this.turnRadar( (turn%2 ? -1 : 1) * 15 )
                break
                
            case 'lock':
                this.turnRadar( (turn%2 ? -1 : 1) * 15 )
                break
        }
        
        this.state = 'search'
    },
    
    onRobotScanned: function(enemy) {        
        var angle = enemy.bearing - this.gunBearing
        angle = angle < -180 ? 360 + angle : angle

        this.turnGunRight(angle)

        this.state = 'lock'
        if(Math.abs(angle) <= 1 && this.energy > 10) {
            this.fire(enemy.velocity < 1 ? 4 : 1) 
        }
    },
    
    onHitWall: function() {
        this.direction = this.direction == 'ahead' ? 'back' : 'ahead'
    },
    
    dance: function() {
        this.turnRadarLeft(15)
        if(this.gunBearing != 0) {
            this.turnGunRight()
        }
        if(this.headin != 0) {
            this.turnLeft()
        }
    },
    
    onHitRobot: function() {
        this.turnRight()
    }
    
})

new TrackerRobot()