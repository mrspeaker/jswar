// Some utils we'll use

var x$ = {
    
    max: function(array) {
        return Math.max.apply(Math, array);
    },
    
    min: function( array ) {
        return Math.min.apply(Math, array);
    },
    
    bind: function(func, o) {
        return function() {
            func.apply(o, arguments);
        }
    },
    
    each: function(items, func) {
        for(var i=0; i<items.length; i++) {
            func.apply(items[i])
        }
    },
    
    image: function(url) {
        var i = new Image()
        i.src = url
        return i
    }
    
}