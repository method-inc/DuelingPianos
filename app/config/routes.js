var home = require('../controllers/home'),
    hunter = require('../controllers/hunter');

exports = module.exports = function(server) {

  server.all('/', home.index);
  server.all('/club/:club', home.club);

  // Tests
  
  server.all('/test', home.test);
  server.all('/vis', hunter.vis);
}