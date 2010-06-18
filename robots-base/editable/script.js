importScripts('robot.js');

var MyRobot = Robot.extend({

    direction: 'ahead',
    
    play: function() {
        if(this.direction == 'ahead') this.ahead(); else this.back();
        if(this.gunBearing != 180) {
            this.turnGunRight(2)
        }
    },
    
    onRobotScanned: function(e) {
        this.fire(1)
    },
    
    onHitWall: function() {
        if(this.direction == 'ahead') this.direction = 'back'; else this.direction = 'ahead';
        this.turnRight(30);
    },
    
    onHitRobot: function() {
        if(this.direction == 'ahead') this.direction = 'back'; else this.direction = 'ahead';
        this.turnRight(30);
    }
    
})

new MyRobot()










