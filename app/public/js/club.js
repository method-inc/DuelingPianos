(function() {
  
  function ClubController() {
    
  };
  
  ClubController.prototype = {
    
    chooseSong: function(id) {
      $('#club').addClass('stage');
    }
    
  };
  
  window.club = new ClubController();
  
})();