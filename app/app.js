// Establish a working directory

var root = require('path').normalize(__dirname + '/..');

// Modules

var express         = require('express'),
    connectTimeout  = require('connect-timeout'),
    stylus          = require('stylus'),
    connectRedis    = require('connect-redis')(require('connect')),
    redis           = require('redis');

require('../lib/uuidstuff');

// Server export

exports = module.exports = (function() {
  
  var server = express.createServer(),
      options = require('./config/constants')([server.set('env')]),
      redisClient = redis.createClient(options.redis.port, options.redis.host);

  GLOBAL.app = server;

  console.log("Environment: " + server.set('env'));
  
  // Config (all)
  
  server.configure(function() {
    
    // Settings
    
    server.set('app root', root + '/app');
    server.set('view engine', options.view_engine || 'jade');
    server.set('views', server.set('app root') + '/views');
    server.set('public', server.set('app root') + '/public');
    server.set('port', options.port);
    server.set('host', options.host);
    server.set('labs', options.labs);
    server.set('redisClient', redisClient);
    
    // Middleware
    
    server.use(connectTimeout({ time: options.reqTimeout }));
    server.use(stylus.middleware({
      src: server.set('views'),
      dest: server.set('public'),
      debug: false,
      compileMethod: function(str) {
        return stylus(str, path)
          .set('compress', options.compressCss)
          .set('filename', path);
      },
      force: true
    }));
    server.use(express['static'](server.set('app root') + '/public'));
    server.use(express.cookieParser());
    server.use(express.session({
      secret: Math.uuidFast(),
      key: options.sessionKey,
      store: new connectRedis({
        maxAge: options.maxAge,
        host: options.redis.host,
        port: options.redis.port
      })
    }));
    server.use(express.bodyParser());
    server.use(server.router);
    server.use(express.errorHandler({ dumpExceptions: options.dumpExceptions, showStack: options.showStack}));
    
    // Nowjs game controller
    
    require('./controllers/game').init(server);
    
    // Helpers
    
    require('./config/helpers')(server);
    
    // Map routes
    
    require('./config/routes')(server);

  });
  
  // Config (development)
  
  server.configure('development', function() {
    server.use(express.logger({ format: ':method :url :status' }));
  });
      
  // Config (staging)
  
  server.configure('staging', function() {
    server.use(express.logger({ format: ':method :url :status' }));
  });
      
  // Config (production)
  
  server.configure('production', function() {

  });
  
  // Handle errors
  
  require('./config/errors.js')(server);
    
  // Export the server
  
  return server;
  
})();
