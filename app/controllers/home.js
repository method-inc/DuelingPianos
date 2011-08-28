exports = module.exports = {

  index: function(req, res) {
    res.render('home/index', {layout: 'layout'})
  },
  
  club: function(req, res) {
    require("../models/songs").listAll(function(songs) {
      res.render('home/club', {songs: songs, layout: 'layout'})
    })
  }
}