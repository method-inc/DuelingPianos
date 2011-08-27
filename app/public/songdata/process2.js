var fs = require('fs');

// Options

var LOUDNESS = -60;
var CONFIDENCE = 0.3;

function map(segment) {
  var average = 0, keys = [], strongest_pitch = 0;
  if (segment.confidence >= CONFIDENCE) {
    segment.pitches.forEach(function(pitch_level, pitch_index) {
      //average += (pitch_level * pitch_index);
      if (pitch_level > strongest_pitch) {
        average = pitch_index;
        strongest_pitch = pitch_level;
      }
    });
    average = Math.round(average / segment.pitches.length);
    var new_key = {
      type: 'yellow',
      pitch: average,
      start: segment.start * 1000,
      stop: (segment.start + segment.duration) * 1000,
      strength: 1
    };
    keys.push(new_key);
  }
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