importScripts('robot.js');

var CrazyRobot = Robot.extend({
    
    direction: 'ahead',
    
    play: function(state) {

        if(this.direction == 'ahead') {
            this.ahead()
        } else {
            this.back()
        }

        this.turnRight()
        this.turnGunRight()
        this.fire(1)
        
    },
    
    onRobotScanned: function(enemy) {
        this.fire(3.5)
    },
    
    onHitWall: function() {
        this.direction = this.direction == 'ahead' ? 'back' : 'ahead'
    }
    
})

new CrazyRobot()