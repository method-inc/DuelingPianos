function Songs() {}

exports = module.exports = new Songs()

Songs.prototype.listAll = function(callback) {
  callback(songs);
}



var songs = [
  {name: '"Lighters" (piano version) mixed with "The Lazy Song" and "Billionaire"', ytid: '0nerqy_da30'},
  {name: "Stand By Me", ytid: 'zuqJ1Q_px5k'},
  {name: "Right Now", ytid: '5aTYp8-O96M'}
]