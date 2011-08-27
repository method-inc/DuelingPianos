var fs = require('fs');

// Options

var key_map = {
  'blue': {
    confidence: 0.3,
    pitch: 0.7,
    loudness: -30
  },
  'yellow': {
    confidence: 0.9,
    pitch: 0.7,
    loudness: -60
  },
  'red': {
    confidence: 0.9,
    pitch: 0.7,
    loudness: -30
  }
};

function map(segment) {
  var keys = [], type, thresholds;
  // Loop through each pitch in this segment
  segment.pitches.forEach(function(pitch, index) {
    // Figure out if any note type matches this pitch
    var new_key = {
      type: undefined,
      pitch: -1,
      start: segment.start * 1000,
      stop: (segment.start + segment.duration) * 1000
    };
    for (var key_type in key_map) {
      thresholds = key_map[key_type];
      if(segment.confidence >= thresholds.confidence &&
         segment.loudness_start >= thresholds.loudness &&
         pitch >= thresholds.pitch) {
        // Update our best match information
        new_key.type = key_type;
        new_key.pitch = index;
      }
    }
    // Add the best match to our keys array
    if (new_key.type) {
      keys.push(new_key);
    }
  });
  // Return all the keys we found in this segment
  return keys;
}

// Files

var filename = __dirname + '/' + process.argv[2];   // ex: 1_full (no extension)
var in_file = filename + '.json';
var out_file = filename + '.keys.json';

console.log("\n\nReading file...")
var song_text = fs.readFileSync(in_file, 'utf-8');

console.log("\nExtracting segments...");
var song_data = JSON.parse(song_text);
var segments = song_data.segments;
console.log("\nTotal segments: " + segments.length);

console.log("\nFiltering segments to keys...");
var song = { keys: [] };
var new_key;
segments.forEach(function(segment) {
  var keys = map(segment);
  song.keys = song.keys.concat(keys);
});
console.log("\nTotal keys: " + song.keys.length);

console.log("\nSaving song...");
var json_string = JSON.stringify(song);
fs.writeFileSync(out_file, json_string);

console.log("done.");