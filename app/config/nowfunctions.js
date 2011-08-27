var nowjs = require("now")

exports = module.exports = function(server) {
  
  var everyone = nowjs.initialize(server);
  
  
  everyone.now.testVar = "my test var";
  
  
}