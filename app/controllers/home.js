exports = module.exports = {

  index: function(req, res) {
    res.render('home/index', {layout: 'layout'})
  },
  
  club: function(req, res) {
    require("../models/songs").listAll(function(songs) {
      res.render('home/club', {songs: songs, layout: 'layout'})
    })
  },
  
  nowjs: function(req, res) {
    res.render('home/nowjs', {layout: 'layout'})
  },
  
  youtube: function(req, res) {
    res.render('home/youtube', {layout: 'layout'})
  }
}