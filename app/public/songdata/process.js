var fs = require('fs');

// Options

var CONFIDENCE_THRESHOLD = 0.7;

// Files

var filename = __dirname + '/' + process.argv[2];   // ex: 1_full (no extension)
var in_file = filename + '.json';
var out_file = filename + '.keys.json';

console.log("\n\nReading file:\n")
var song_text = fs.readFileSync(in_file, 'utf-8');
console.log(song_data);

console.log("\n\nExtracting segments:\n");
var song_data = JSON.parse(song_text);
var segments = song_data.segments;
console.log(segments);
console.log("\n\nTotal segments: " + segments.length);

console.log("\n\nFiltering segments to keys:\n");
var song = { keys: [] };
var new_key, pitch, level;
segments.forEach(function(segment) {
  if (segment.confidence > CONFIDENCE_THRESHOLD) {
    // Find the single pitch that is represented most strongly by this segment
    pitch = -1, level = 0;
    segment.pitches.forEach(function(pitch_level, index) {
      if (pitch_level > level) {
        pitch = index;
        level = pitch_level;
      }
    });
    new_key = {
      pitch: pitch,
      start: segment.start,
      stop: segment.start + segment.duration
    };
    song.keys.push(new_key);
  }
});
console.log(song.keys);
console.log("\n\nTotal keys: " + song.keys.length);

console.log("\n\nSaving song:\n");
var json_string = JSON.stringify(song);
fs.writeFileSync(out_file, json_string);
console.log("done.");