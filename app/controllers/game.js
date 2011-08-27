var nowjs = require("now")

exports = module.exports = function(server) {
  
  var game = nowjs.initialize(server);
  
  
  game.now.testVar = "my test var";
  
  game.now.logstuff = function(msg) {
    console.log(msg);
  }
  
  
}