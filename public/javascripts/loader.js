var AsyncLoader = Class.extend({
    
    constructor: function(items, timeout, loadedCallback, timeoutCallback) {
        this.timeout = timeout
        this.loadedCallback = loadedCallback
        this.timeoutCallback = timeoutCallback
        this.items = items
        this.startTime = new Date().getTime()
        this.checkTimer = setInterval(x$.bind(this.check, this), 5)
    },
    
    check: function() {
        if(new Date().getTime() - this.startTime > this.timeout) {
            clearInterval(this.checkTimer)
            var notLoaded = []
            for(var i=0; i<this.items.length; i++) {
                if(!this.items[i].isLoaded()) {
                    notLoaded.push(this.items[i])
                }
            }
            this.timeoutCallback(notLoaded)
            return false
        }
        for(var i=0; i<this.items.length; i++) {
            if(!this.items[i].isLoaded()) {
                return false
            }
        }
        clearInterval(this.checkTimer)
        this.loadedCallback()
    }
    
})

var NeedLoading = Class.extend({
    
    constructor: function(items, name) {
        this.waitFor = items.length
        for(var i=0; i<items.length; i++) {
            items[i].onload = x$.bind(this.onload, this)
        }
        this.name = name || 'Unknow'
    },
    
    onload: function() {
        this.waitFor--
    },
    
    isLoaded: function() {
        return this.waitFor == 0
    },
    
    toString: function() {
        return this.name
    }
    
})