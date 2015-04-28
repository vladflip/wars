(function() {
  module.exports = function(req, res, next) {
    var a;
    a = {
      fuck: 'fuckee'
    };
    return res.send("" + a.fuck);
  };

}).call(this);
