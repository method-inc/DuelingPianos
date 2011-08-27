// remove any leftover sock files
var exec = require('child_process').exec;
exec("rm *.sock", function(err, stdout, stderr) {
  console.log(stderr);
  console.log(stdout);
});


var cluster = require('cluster'),
    port    = 80;

console.log("Opening server on port " + port + "...");


cluster('./app/app')
  .set('workers', 1)
  .use(cluster.debug())
  .use(cluster.reload())
  .listen(port);