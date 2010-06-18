var Geometry = {
    
    /**
     * If the centre of the rectangle is the origin, 
     * if one corner of the rectangle has co-ordinates (x,y), 
     * its co-ordinates after the rotation by a would be (x * cos a - y * sin a, x * sin a + y * cos a)
     */
    rotate: function(point, angle) {
        return {x: point.x * Math.cos(angle) - point.y * Math.sin(angle), y: point.x * Math.sin(angle) + point.y * Math.cos(angle)}
    },
    
    rotateAll: function(points, angle) {
        var result = []
        for(var i=0; i<points.length; i++) {
            result.push(Geometry.rotate(points[i], angle))
        }
        return result
    },
    
    translate: function(point, by) {
        return {x: point.x + by.x, y: point.y + by.y}
    },
    
    translateAll: function(points, by) {
        var result = []
        for(var i=0; i<points.length; i++) {
            result.push(Geometry.translate(points[i], by))
        }
        return result
    },
    
    toDegree: function(radian) {
        var d = Math.round(d = 180 * (radian) / Math.PI)
        if(d == 360) d = 0
        return d
    },
    
    toRadian: function(degree) {
        var r = Math.PI * (degree) / 180
        if(r == 2 * Math.PI) r = 0
        return r
    },
    
    distance: function(p1, p2) {
        return Math.sqrt( (p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y) )
    },
    
    normalizeAngle: function(angle) {
        if(angle < 0 || angle >= Math.PI * 2) {
            return Math.abs((Math.PI * 2) - Math.abs(angle))
        }
        return angle
    },
    
    // A solid box
    Box: Class.extend({
        
        constructor: function(x, y, size, angle) {
            this.x = x
            this.y = y
            this.size = size
            this.angle = angle
        },
        
        corners: function() {
            return Geometry.translateAll(
                Geometry.rotateAll([
                    {x: - this.size / 2, y: - this.size / 2},
                    {x: + this.size / 2, y: - this.size / 2},
                    {x: + this.size / 2, y: + this.size / 2},
                    {x: - this.size / 2, y: + this.size / 2}
                ], this.angle),
                this
            )
        },
        
        asPolygon: function() {
            return new Geometry.Polygon(this.corners())
        },
        
        move: function(velocity) {
            var g = this.moveGhost(velocity)
            this.x = g.x
            this.y = g.y
        },
        
        moveGhost: function(velocity) {
            var v = this.directionVector(velocity)
            return new Geometry.Box(
                 this.x + v.x,
                 this.y - v.y,
                 this.size,
                 this.angle
            )
        },
        
        directionVector: function(velocity) {
            return new Geometry.Vector(Math.round(Math.sin(this.angle) * velocity), Math.round(Math.cos(this.angle) * velocity))
        },
        
        toString: function() {
            return this.x + ',' + this.y + '(' + Geometry.toDegre(this.angle) + ')'
        }
        
    }),
    
    // Basic vector implementation
    Vector: Class.extend({

        constructor: function(x, y) {
            this.x = x
            this.y = y        
        },

        // Returns the dot product of self and other (Vector)
        dot: function(other) {
            return this.x * other.x + this.y * other.y
        },

        cross: function(other) {
            return (this.x * other.y) - (this.y * other.x)
        },

        add: function(other) {
            return new Geometry.Vector(this.x + other.x, this.y + other.y)
        },

        neg: function() {
            return new Geometry.Vector(-this.x, -this.y)
        },

        sub: function(other) {
            return this.add(other.neg())
        },

        mul: function(scalar) {
            return new Geometry.Vector(this.x * scalar, this.y * scalar)
        },

        div: function(scalar) {
            return this.mul(1.0/scalar)
        },

        magnitude: function() {
            return Math.sqrt(this.x * this.x + this.y * this.y)
        },
        
        angle: function(other) {
            var cosA = this.dot(other) / (this.magnitude() * other.magnitude())
            return Math.acos(cosA)
        },

        // Returns this vector's unit vector (vector of	magnitude 1 in the same direction)
        normalize: function() {
            var inverse_magnitude = 1.0 / this.magnitude()
            return new Geometry.Vector(this.x * inverse_magnitude, this.y * inverse_magnitude)
        },

        //Returns a vector perpendicular to self
        perpendicular: function() {
            return new Geometry.Vector(-this.y, this.x)
        }

    }),

    // A projection (1d line segment)
    Projection: Class.extend({

        constructor: function(min, max) {
            this.min = min
            this.max = max
        },

        intersects: function(other) {
            return this.max > other.min && other.max > this.min
        }

    }),

    Polygon: Class.extend({

        // p is a [{x,y},...]
        constructor: function(p) {
            this.points = []
            for(var i=0; i<p.length; i++) {
                this.points.push(new Geometry.Vector(p[i].x, p[i].y))
            }
            this.edges = []
            for(var i=0; i<this.points.length; i++) {
                var point = this.points[i]
                var next_point = this.points[(i+1) % this.points.length]
                this.edges.push(next_point.sub(point))
            }
        },

        // axis is the unit vector (vector of magnitude 1) to project the polygon onto
        projectToAxis: function(axis) {
            var projected_points = []
            for(var i=0; i<this.points.length; i++) {
                var point = this.points[i]
                // Project point onto axis using the dot operator
                projected_points.push(point.dot(axis))
            }
            return new Geometry.Projection(x$.min(projected_points), x$.max(projected_points))
        },

        // Returns whether or not two polygons intersect
        intersects: function(other) {

            // Create a list of both polygons' edges
            var edges = [].concat(this.edges, other.edges)
            for(var i=0; i<edges.length; i++) {
                var edge = edges[i]
                var axis = edge.normalize().perpendicular() // Create the separating axis 

                // Project each to the axis
    			var selfProjection = this.projectToAxis(axis)
    			var otherProjection = other.projectToAxis(axis)

    			// If the projections don't intersect, the polygons don't intersect
    			if(!selfProjection.intersects(otherProjection)) {
    			    return false
    			}
            }
            return true
        },

        // Return is a point is inside of the polygon
        //
        // If the polygon is convex then one can consider the polygon as a "path" from the first vertex. 
        // A point is on the interior of this polygons if it is always on the same side of all the line 
        // segments making up the path.
        containsPoint: function(p) {
            var mustBeOnSide
            for(var i=0; i<this.points.length; i++) {
                var point = this.points[i]
                var next_point = this.points[(i+1) % this.points.length]

                // if it is less than 0 then P is to the right of the line segment, if greater than 0 it is to the left, 
                // if equal to 0 then it lies on the line segment.
                var side = (p.y - point.y) * (next_point.x - point.x) - (p.x - point.x) * (next_point.y - point.y)
                if(mustBeOnSide == undefined) {
                    mustBeOnSide = (side < 0 ? 'left' : 'right')
                } else {
                    if((side < 0 ? 'left' : 'right') != mustBeOnSide) {
                        return false
                    }
                }
            }
            return true
        },

        // Return if the other polygon is inside this one
        contains: function(other) {
            for(var i=0; i<other.points.length; i++) {
                var point = other.points[i]
                if(!this.containsPoint(point)) {
                    return false
                }
            }
            return true
        }

    }) 

 
}
