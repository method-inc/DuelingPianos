var fs = require('fs');
var EventEmitter = require('events').EventEmitter;

var song_dir = GLOBAL.app.set('app root') + '/public/songdata/';


//var song_dir = '/Users/hunter/skookum/app/public/songdata/';


function Performance(options) {
  this.player_id = options.player_id;
  this.range = options.range || 300;  // What range (in ms) must an acceptable key fall into?
  this.song = undefined;
  this.tips = 0;
  this.streak = 0;
  this.last_key_index = -1;
}

Performance.prototype = Object.create( EventEmitter.prototype );

Performance.prototype.catch_up = function(ms) {
  
};

// Client can tell the server to load a song for a performance
Performance.prototype.load_song = function(id, callback) {
  var self = this;
  fs.readFile(song_dir + id + '.keys.json', 'utf-8', function(err, data) {
    if (err) throw err;
    self.song = JSON.parse(data);
    // Initialize each key to an unpressed state
    self.song.keys.forEach(function(key) {
      key.available = true;
    });
    // Set the last key to nothing
    self.last_key_index = -1;
    return callback && callback();
  });
};

Performance.prototype.status = function(ms, callback) {
  return callback(undefined, []);
  var i = this.last_key_index, deadkeys = [];
  var past_boundary_ms = ms - this.range;
  while (i < this.keys.length && this.keys[i].start < past_boundary_ms) {
    this.keys[i].available = false;
    deadkeys.push(i);
    i++;
  }
  this.last_key_index = i;
  return callback && callback(undefined, deadkeys);
};

// Client can tell the server the user just pressed a key
Performance.prototype.press_key = function(pitch, ms, callback) {
  
  // Find the next available keys
  var i = this.last_key_index,
      start_i = i,
      keys = this.song.keys,
      past_boundary_ms = ms - this.range,
      future_boundary_ms = ms + this.range,
      key, key_ms, deadkeys = [];
      
  if (i >= keys.length) return callback('end of song');
  do {
    i++;
    key = keys[i];
    key_ms = key.start;
    // If they haven't pressed a key in a while we need to invalidate really old keys
    if (key_ms < past_boundary_ms) {
      this.last_key_index = i;
      key.available = false;
      deadkeys.push(i);
    }
    else if (key.available && key.pitch === pitch) {
      // Key was correct (correct pitch within the allowed range of time)
      key.available = false;
      this.last_key_index = i;
      this.update_streak(1);
      console.log("  (was the right key!)");
      console.log("KEY INDEX: " + i);
      return callback(undefined, i);
    }
  } while (key_ms <= future_boundary_ms && i - start_i < 100)
  // Key pressed doesn't have a match at that point in the song
  //this.send_fuckup(pitch);
  this.update_streak(-1);
  return callback && callback('fuckup', deadkeys);
};

// Client can request the current state of this performance at any time
Performance.prototype.get_status = function() {
  return {
    player_id: this.player_id,
    tips: this.tips,
    streak: this.streak
  };
};

// Used internally
Performance.prototype.update_streak = function(delta) {
  if (this.streak >= 0) {
    if (delta > 0) this.streak += delta;
    else this.streak = delta;
  }
  else {
    if (delta < 0) this.streak += delta;
    else this.streak = delta;
  }
  if (this.streak > 10) this.send_tips(+3);
  else this.send_tips(+1);
  this.send_streak();
};

// Server can tell the client the user fucked up
Performance.prototype.send_fuckup = function(pitch) {
  this.emit('fuckedUp', this.player_id, pitch);
};

// Server can tell the client to update to user's streak
Performance.prototype.send_streak = function() {
  this.emit('updatedStreak', this.player_id, this.streak);
};

// Server can tell the client to update the user's tips
Performance.prototype.send_tips = function() {
  this.emit('updatedTips', this.player_id, this.tips);
};

exports = module.exports = Performance;


// Quick test

/*
var p = new Performance();

p.load_song('zuqJ1Q_px5k', function() {
console.log("song loaded:");
console.log(p.song);
});
*/