(function($) {

  function SongVis(options) {
    this.container = $('#' + options.container);
    this.container.addClass('songvis');
    this.keyroll = $('<div></div').addClass('keyroll');
    this.keyroll.appendTo(this.container);
    this.mx_to_px = options.ratio || 0.01;
    this.lookahead = options.lookahead || 0;
    for(var i = 0; i < 12; i++) {
      var new_pitch = $('<div></div>').addClass('pitch');
      new_pitch.appendTo(this.keyroll);
    }
    this.playhead = $('<div></div>').addClass('playhead');
    this.playhead.appendTo(this.container);
    this.keys = [];
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
          callback && callback(undefined);
        },
        error: function(xhr, error, msg) {
          console.log("Error pulling song data");
          callback && callback("Couldn't load song");
        }
      });
    },
    render: function(song) {
      var ms_to_px = this.mx_to_px;
      var keyroll = this.keyroll;
      var pitches = keyroll.find('.pitch');
      var pitch, pitch_el, key, key_el, top, i;
      i = song.keys.length;
      var bottom = song.keys[song.keys.length - 1].stop * ms_to_px;
      while(i--) {
        key = song.keys[i];
        pitch_el = pitches[key.pitch];
        key.el = $('<div></div>').addClass('key');
        key.el.appendTo(pitch_el);
        this.keys.push(key);
        height = (key.stop - key.start) * ms_to_px;
        top = bottom - (key.start * ms_to_px) - height;
        key.el.css({ 'left': 0, 'top': top + 'px', 'height': height + 'px' });
      }
      var last_top = song.keys[song.keys.length - 1].stop * ms_to_px;
      keyroll.css({ 'height': last_top + 'px' });
      this.position = 0;
    },
    seek: function(ms) {
      ms += this.lookahead;
      this.position = ms * this.mx_to_px;
      //this.playhead && this.playhead.css({ 'top': this.position + 'px' });
      var bottom = -this.position + 30;
      this.keyroll.css({ 'bottom': -this.position + 'px' });
      var i = this.keys.length;
      
    }
  };
  
  window.SongVis = SongVis;
  
})(jQuery);
