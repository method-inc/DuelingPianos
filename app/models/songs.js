function Songs() {}

exports = module.exports = new Songs();

Songs.prototype.listAll = function(callback) {
  
  var songs = [
    {name: "Right Now", ytid: '5aTYp8-O96M'},
    {name: "Fireflies", ytid: 'Ph4ehVVbIpU'},
    {name: 'Lighters/Lazy Song/Billionaire', ytid: '0nerqy_da30'},
    {name: 'Mouthwash', ytid: 'TjQaxCFjCX4'}
  ];

  callback(songs);
};

