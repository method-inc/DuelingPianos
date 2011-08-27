var fs = require('fs');

// Options

var CONFIDENCE_THRESHOLD = 0.5;
var PITCH_THRESHOLD = 0.2;
var LOUDNESS_THRESHOLD = -30;

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
var new_key;
segments.forEach(function(segment) {
  if (segment.confidence > CONFIDENCE_THRESHOLD && segment.loudness_max > LOUDNESS_THRESHOLD) {
    // Find the single pitch that is represented most strongly by this segment
    segment.pitches.forEach(function(pitch, index) {
      if (pitch > PITCH_THRESHOLD) {
        new_key = {
          pitch: index,
          start: segment.start * 1000,
          stop: (segment.start + segment.duration) * 1000
        };
        song.keys.push(new_key); 
      }
    });
  }
});
console.log(song.keys);
console.log("\n\nTotal keys: " + song.keys.length);

console.log("\n\nSaving song:\n");
var json_string = JSON.stringify(song);
fs.writeFileSync(out_file, json_string);
console.log("done.");