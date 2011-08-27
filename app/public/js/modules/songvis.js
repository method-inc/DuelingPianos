(function($) {

  function SongVis(options) {
    this.keyroll = $('#' + options.container)
    this.mx_to_px = options.ratio || 0.01;
    for(var i = 0; i < 12; i++) {
      var new_pitch = $('<div></div>').addClass('pitch');
      new_pitch.appendTo(this.keyroll);
    }
    this.playhead = $('<div></div>').addClass('playhead');
    this.playhead.appendTo(this.keyroll);
    this.seek(0);      
  }
  SongVis.prototype = {
    load_song: function(url, callback) {
      var self = this;
      this.url = url;
      $.ajax({
        url: url,
        dataType: 'json',
        success: function(song) {
          self.render(song);
          callback(undefined);
        },
        error: function(xhr, error, msg) {
          console.log("Error pulling song data");
          callback("Couldn't load song");
        }
      });
    },
    render: function(song) {
      console.log('render');
      var ms_to_px = this.mx_to_px;
      var keyroll = this.keyroll;
      var pitches = keyroll.find('.pitch');
      var pitch, pitch_el, key, key_el, top, i;
      i = song.keys.length;
      while(i--) {
        key = song.keys[i];
        pitch_el = pitches[key.pitch];
        key_el = $('<div></div>').addClass('key');
        key_el.appendTo(pitch_el);
        top = key.start * ms_to_px;
        height = (key.stop - key.start) * ms_to_px;
        key_el.css({ 'left': 0, 'top': top + 'px', 'height': height + 'px' });
      }
      var last_top = song.keys[song.keys.length - 1].stop * ms_to_px;
      keyroll.css({ 'height': last_top + 'px' });
      this.position = 0;
    },
    seek: function(ms) {
      this.position = ms * this.mx_to_px;
      this.playhead && this.playhead.css({ 'top': this.position + 'px' });
    }
  };
  
  window.SongVis = SongVis;
  
})(jQuery);
