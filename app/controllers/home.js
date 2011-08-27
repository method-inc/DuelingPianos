exports = module.exports = {

  index: function(req, res) {
    res.render('home/index', {layout: 'layout'})
  },
  
  club: function(req, res) {
    
    var song = {name: '"Lighters" (piano version) mixed with "The Lazy Song" and "Billionaire"',
                ytid: '0nerqy_da30'};
    
    var songs = [song];
    
    res.render('home/club', {songs: songs, layout: 'layout'})
  },
  
  test: function(req, res) {
    res.render('home/test', {layout: 'layout'})
  }
}