exports = module.exports = {

  index: function(req, res) {
    res.render('home/index', {layout: 'layout'})
  },
  
  club: function(req, res) {
    res.render('home/club', {layout: 'layout'})
  }
}