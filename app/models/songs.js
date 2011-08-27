function Songs() {}

exports = module.exports = new Songs()

Songs.prototype.listAll = function(callback) {
  callback(songs);
}



var songs = [
  {name: '"Lighters" (piano version) mixed with "The Lazy Song" and "Billionaire"', ytid: '0nerqy_da30', data: '/1_full.keys.json'}
]
