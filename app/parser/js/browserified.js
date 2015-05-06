(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
; var __browserify_shim_require__=require;(function browserifyShim(module, exports, require, define, browserify_shim__define__module__export__) {
/**
 * CSS-JSON Converter for JavaScript
 * Converts CSS to JSON and back.
 * Version 2.1
 *
 * Released under the MIT license.
 *
 * Copyright (c) 2013 Aram Kocharyan, http://aramk.com/
 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 The above copyright notice and this permission notice shall be included in all copies or substantial portions
 of the Software.
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

var CSSJSON = new function () {

    var base = this;

    base.init = function () {
        // String functions
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/g, '');
        };

        String.prototype.repeat = function (n) {
            return new Array(1 + n).join(this);
        };
    };
    base.init();

    var selX = /([^\s\;\{\}][^\;\{\}]*)\{/g;
    var endX = /\}/g;
    var lineX = /([^\;\{\}]*)\;/g;
    var commentX = /\/\*[\s\S]*?\*\//g;
    var lineAttrX = /([^\:]+):([^\;]*);/;

    // This is used, a concatenation of all above. We use alternation to
    // capture.
    var altX = /(\/\*[\s\S]*?\*\/)|([^\s\;\{\}][^\;\{\}]*(?=\{))|(\})|([^\;\{\}]+\;(?!\s*\*\/))/gmi;

    // Capture groups
    var capComment = 1;
    var capSelector = 2;
    var capEnd = 3;
    var capAttr = 4;

    var isEmpty = function (x) {
        return typeof x == 'undefined' || x.length == 0 || x == null;
    };

    /**
     * Input is css string and current pos, returns JSON object
     *
     * @param cssString
     *            The CSS string.
     * @param args
     *            An optional argument object. ordered: Whether order of
     *            comments and other nodes should be kept in the output. This
     *            will return an object where all the keys are numbers and the
     *            values are objects containing "name" and "value" keys for each
     *            node. comments: Whether to capture comments. split: Whether to
     *            split each comma separated list of selectors.
     */
    base.toJSON = function (cssString, args) {
        var node = {
            children: {},
            attributes: {}
        };
        var match = null;
        var count = 0;

        if (typeof args == 'undefined') {
            var args = {
                ordered: false,
                comments: false,
                stripComments: false,
                split: false
            };
        }
        if (args.stripComments) {
            args.comments = false;
            cssString = cssString.replace(commentX, '');
        }

        while ((match = altX.exec(cssString)) != null) {
            if (!isEmpty(match[capComment]) && args.comments) {
                // Comment
                var add = match[capComment].trim();
                node[count++] = add;
            } else if (!isEmpty(match[capSelector])) {
                // New node, we recurse
                var name = match[capSelector].trim();
                // This will return when we encounter a closing brace
                var newNode = base.toJSON(cssString, args);
                if (args.ordered) {
                    var obj = {};
                    obj['name'] = name;
                    obj['value'] = newNode;
                    // Since we must use key as index to keep order and not
                    // name, this will differentiate between a Rule Node and an
                    // Attribute, since both contain a name and value pair.
                    obj['type'] = 'rule';
                    node[count++] = obj;
                } else {
                    if (args.split) {
                        var bits = name.split(',');
                    } else {
                        var bits = [name];
                    }
                    for (i in bits) {
                        var sel = bits[i].trim();
                        if (sel in node.children) {
                            for (var att in newNode.attributes) {
                                node.children[sel].attributes[att] = newNode.attributes[att];
                            }
                        } else {
                            node.children[sel] = newNode;
                        }
                    }
                }
            } else if (!isEmpty(match[capEnd])) {
                // Node has finished
                return node;
            } else if (!isEmpty(match[capAttr])) {
                var line = match[capAttr].trim();
                var attr = lineAttrX.exec(line);
                if (attr) {
                    // Attribute
                    var name = attr[1].trim();
                    var value = attr[2].trim();
                    if (args.ordered) {
                        var obj = {};
                        obj['name'] = name;
                        obj['value'] = value;
                        obj['type'] = 'attr';
                        node[count++] = obj;
                    } else {
                        if (name in node.attributes) {
                            var currVal = node.attributes[name];
                            if (!(currVal instanceof Array)) {
                                node.attributes[name] = [currVal];
                            }
                            node.attributes[name].push(value);
                        } else {
                            node.attributes[name] = value;
                        }
                    }
                } else {
                    // Semicolon terminated line
                    node[count++] = line;
                }
            }
        }

        return node;
    };

    /**
     * @param node
     *            A JSON node.
     * @param depth
     *            The depth of the current node; used for indentation and
     *            optional.
     * @param breaks
     *            Whether to add line breaks in the output.
     */
    base.toCSS = function (node, depth, breaks) {
        var cssString = '';
        if (typeof depth == 'undefined') {
            depth = 0;
        }
        if (typeof breaks == 'undefined') {
            breaks = false;
        }
        if (node.attributes) {
            for (i in node.attributes) {
                var att = node.attributes[i];
                if (att instanceof Array) {
                    for (var j = 0; j < att.length; j++) {
                        cssString += strAttr(i, att[j], depth);
                    }
                } else {
                    cssString += strAttr(i, att, depth);
                }
            }
        }
        if (node.children) {
            var first = true;
            for (i in node.children) {
                if (breaks && !first) {
                    cssString += '\n';
                } else {
                    first = false;
                }
                cssString += strNode(i, node.children[i], depth);
            }
        }
        return cssString;
    };

    // Helpers

    var strAttr = function (name, value, depth) {
        return '\t'.repeat(depth) + name + ': ' + value + ';\n';
    };

    var strNode = function (name, value, depth) {
        var cssString = '\t'.repeat(depth) + name + ' {\n';
        cssString += base.toCSS(value, depth + 1);
        cssString += '\t'.repeat(depth) + '}\n';
        return cssString;
    };

};
; browserify_shim__define__module__export__(typeof CSSJSON != "undefined" ? CSSJSON : window.CSSJSON);

}).call(global, undefined, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
var CSSJSON, classes, code, game, markup, parser, rules, style;

CSSJSON = require('cssjson');

classes = {
  g: 'game',
  h: 'html',
  c: 'css'
};

rules = {
  html: ['nice', 'button', 'menu'],
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
  fdcl: function(code, cls) {
    return code.getElementsByClassName(cls);
  },
  fdPr: function(elm, cls) {
    while (!elm.classList.contains(cls)) {
      if (elm.parentElement !== null) {
        elm = elm.parentElement;
      } else {
        return false;
      }
    }
    return elm;
  },
  error: function(aspect, obj) {
    switch (aspect) {
      case 'html':
        if (obj.parent.el) {
          return console.log(obj.child["class"] + " element has his " + obj.parent["class"] + " parent");
        } else {
          return console.log(obj.child["class"] + " element has NOT his " + obj.parent["class"] + " parent");
        }
        break;
      case 'css':
        if (obj.rule === obj.real) {
          return console.log(obj.names.property + " of " + obj.names.element + " is right");
        } else {
          return console.log(obj.names.property + " of " + obj.names.element + " is NOT right");
        }
    }
  },
  parseHTML: function(html, code) {
    var elcl, element, elements, i, j, parent, prcl, ref, results;
    results = [];
    for (i = j = 0, ref = html.length; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      elcl = html[i];
      elements = parser.fdcl(code, elcl);
      results.push((function() {
        var k, len, results1;
        results1 = [];
        for (k = 0, len = elements.length; k < len; k++) {
          element = elements[k];
          if (i + 1 < html.length) {
            prcl = html[i + 1];
            parent = parser.fdPr(element, prcl);
            results1.push(parser.error('html', {
              child: {
                el: element,
                "class": elcl
              },
              parent: {
                el: parent,
                "class": prcl
              }
            }));
          } else {
            results1.push(void 0);
          }
        }
        return results1;
      })());
    }
    return results;
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
          results1.push(parser.error('css', {
            rule: rule,
            real: real,
            names: {
              property: property,
              element: element
            }
          }));
        }
        return results1;
      })());
    }
    return results;
  }
};

parser.parseHTML(rules.html, code.html);

parser.parseCSS(rules.css, code.css);



},{"cssjson":1}]},{},[2]);
