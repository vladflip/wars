// Generated by CoffeeScript 1.9.1
(function() {
  var CSSJSON, classes, code, game, markup, parser, rules, style;

  CSSJSON = require('cssjson');

  classes = {
    g: 'game',
    h: 'html',
    c: 'css'
  };

  rules = {
    html: ['menu', 'button', 'nice'],
    css: {
      '.menu': {
        'margin': 'auto',
        'width': '100px'
      },
      '.button': {
        'background-color': '#cfcfcf'
      },
      '.nice': {
        'height': '50px'
      }
    }
  };

  game = document.getElementsByClassName(classes.g)[0];

  markup = game.getElementsByClassName(classes.h)[0];

  style = game.getElementsByClassName(classes.c)[0];

  code = {
    html: markup,
    css: style
  };

  parser = {
    parseHTML: function(html, code) {
      var child, i, j, lower, ref;
      lower = code;
      for (i = j = 0, ref = html.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        child = lower.getElementsByClassName(html[i])[0];
        console.log(child);
        if (child) {
          lower = child;
        } else {
          console.log('KEEP THE RULES(markup error)!!!!');
          return false;
        }
      }
      return console.log('HTML has been successfully parsed');
    },
    parseCSS: function(css, code) {
      var element, json, objects, property, real, results, rule;
      json = CSSJSON.toJSON(code.innerHTML);
      objects = json.children;
      results = [];
      for (element in css) {
        results.push((function() {
          var results1;
          results1 = [];
          for (property in css[element]) {
            rule = css[element][property];
            real = objects[element].attributes[property];
            if (rule === real) {
              results1.push(console.log(property + " of " + element + " is right"));
            } else {
              results1.push(console.log(property + " of " + element + " is NOT right"));
            }
          }
          return results1;
        })());
      }
      return results;
    }
  };

  parser.parseHTML(rules.html, code.html);

  parser.parseCSS(rules.css, code.css);

}).call(this);
