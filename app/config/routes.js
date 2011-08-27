var home = require('../controllers/home');

exports = module.exports = function(server) {

  server.all('/', home.index);
  server.all('/club/:club', home.club)


    server.all('/test', home.test);
}