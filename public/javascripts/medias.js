var Medias = {

    image: function(url) {
        var i = new Image()
        i.src = url
        return i
    },
    
    sound: function(name, volume) {
        if(!Configuration.sound) {
            return {play:function(){}}
        }
        var audioElement = document.createElement('audio');
        audioElement.setAttribute('src', '/assets/sounds/' + name + '.wav')
        audioElement.load()
        audioElement.volume = volume || 1
        return audioElement
    }
    
    
}