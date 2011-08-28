(function($) {

  function SongVis(options) {
    this.container = $('#' + options.container);
    this.container.addClass('songvis');
    this.keyroll = $('<div></div').addClass('keyroll');
    this.keyroll.appendTo(this.container);
    this.mx_to_px = options.ratio || 0.01;
    this.lookahead = options.lookahead || 0;
    this.falloff = options.falloff || 100;
    this.numkeys = options.numkeys || 12;
    this.playkeys = options.playkeys || ['s', 'd', 'f', 'j', 'k', 'l']
    for(var i = 0; i < this.numkeys; i++) {
      var new_pitch = $('<div><div></div></div>').addClass('pitch');
      new_pitch.appendTo(this.keyroll);
      
      if (i == this.numkeys / 2 - 1) {
        var gutter = $('<div></div>').addClass('pitch gutter');
        gutter.appendTo(this.keyroll);
      }
      
    }
    this.playhead = $('<div></div>').addClass('playhead');
    this.playhead.appendTo(this.container);
    this.playhead.css({ 'bottom': (this.falloff - 25) + 'px' });
    
    this.keychart = $('<div></div>').addClass('keychart');
    for(var i = 0; i < this.numkeys; i++) {
      var new_chart = $('<div>'+this.playkeys[i]+'</div>').addClass('chart');
      new_chart.appendTo(this.keychart);
      
      if (i == this.numkeys / 2 - 1) {
        var gutter = $('<div>0</div>').addClass('chart gutter');
        gutter.appendTo(this.keychart);
      }
    }
    this.keychart.appendTo(this.container);
    
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
      var pitches = keyroll.find('.pitch > div');
      pitches.html('');
      var pitch, pitch_el, key, key_el, top;
      var bottom = song.keys[song.keys.length - 1].stop * ms_to_px;
      for(var i = 0; i < song.keys.length; i++) {
        key = song.keys[i];
        pitch_el = pitches[key.pitch];
        key.el = $('<div></div>').addClass('key').addClass(key.type).css({ 'opacity': (key.strength * key.strength * key.strength * key.strength), 'z-index': song.keys.length + 10 - i });
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
      var bottom = this.position - this.falloff;
      this.keyroll.css({ 'webkitTransform': 'translateY(' + (bottom) + 'px)',  '-moz-transform': 'translateY(' + (bottom) + 'px)' });
      var i = this.keys.length;
    },
    activate_key: function(key_index) {
      this.keys[key_index].el.addClass('active');
    },
    kill_key: function(key_index) {
      this.keys[key_index].el.addClass('dead');
    }
  };
  
  window.SongVis = SongVis;
  
})(jQuery);
