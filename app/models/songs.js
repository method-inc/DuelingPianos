function Songs() {}

exports = module.exports = new Songs()

Songs.prototype.listAll = function(callback) {
  var song = {name: '"Lighters" (piano version) mixed with "The Lazy Song" and "Billionaire"',
                ytid: '0nerqy_da30'};
    
  var songs = [song];
  callback(songs);
}
