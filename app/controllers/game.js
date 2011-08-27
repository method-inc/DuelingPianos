var nowjs = require("now")

exports = module.exports = function(server) {
  
  var game = nowjs.initialize(server);
  
  
  game.now.testVar = "my test var";
  
  game.now.logstuff = function(msg, callback) {
    console.log(msg);
    if (msg === 'callmeback') callback('tag!');
  }
  
  
}