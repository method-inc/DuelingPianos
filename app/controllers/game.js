var nowjs = require("now")

exports = module.exports = function(server) {
  
  var game = nowjs.initialize(server);
  
  var obj = {
    lobby: {
      players: []
    },
    clubs: [
      {name:"The Stinky Squirrel", players: [], spectators: []}
    ]
  }
  
  game.now.logstuff = function(msg, callback) {
    console.log(msg);
    if (msg === 'callmeback') callback('tag!');
  }
  
  
}