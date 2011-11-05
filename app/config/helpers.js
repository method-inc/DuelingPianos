exports = module.exports = function(server) {
  
  server.helpers({
    base_url: server.set('host'),
    labs_url: server.set('labs')
  });
};