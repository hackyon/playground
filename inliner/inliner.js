/**
 * Inlines the styles from the stylesheets into their corresponding
 * DOM elements. The most obvious use case is sending HTML emails 
 * (because email clients tend to remove all the non-inline styles).
 * 
 * PhantomJS (phantomjs.org) is used to parse and manipulate the DOM.
 */

var page   = require('webpage').create()
  , system = require('system');

if (system.args.length !== 2) {
  console.log('Usage: phantomjs inliner.js <file>');
  phantom.exit();
}

page.onConsoleMessage = function(message) {
  console.error(message);
};

var file = system.args[1];
page.open(file, function(status) {
  if (status !== 'success') {
    console.error('The file cannot be loaded');
  } else {
    var html = page.evaluate(function() {
      /**
       * The original implementation used getMatchedCSSRules() but that
       * function did not return matching descendent selectors (such as 
       * '.test div').
       * 
       * The current implementation runs through each CSS rule and uses
       * querySelectorAll() to get a list of matched elements. The
       * rules are reorganized by element, and are sorted by specificity
       * before being applied to the element.
       */ 

      var rulesByElement = [ ];

      var styleSheets = document.styleSheets;
      for (var s = 0; s < styleSheets.length; s++) {
        var rules = styleSheets[s].cssRules;

        for (var r = 0; r < rules.length; r++) {
          var rule = rules[r];
          if (!rule.selectorText) continue;
          var selectors = rule.selectorText.split(',');

          // Split the selectors since we will need to compute 
          // specificity for each one individually
          for (var i = 0; i < selectors.length; i++) {
            var matches = document.querySelectorAll(selectors[i]);

            for (var m = 0; m < matches.length; m++) {

              // Search for it in the existing list of elements
              var exists = false;
              for (var e = 0; e < rulesByElement.length; e++) {
                if (rulesByElement[e].element == matches[m]) {
                  rulesByElement[e].rules.push(rule);
                  rulesByElement[e].selectors.push(selectors[i].trim());
                  exists = true;
                  break;
                }
              }

              if (!exists) {
                rulesByElement.push({
                  element: matches[m],
                  rules: [ rule ],
                  selectors: [ selectors[i].trim() ] 
                });
              }
            }
          }
        }
      }

      for (var e = 0; e < rulesByElement.length; e++) {
        var element = rulesByElement[e].element;
        var rules   = rulesByElement[e].rules;
        var selectors = rulesByElement[e].selectors;

        // Compute specificity for each rule
        for (var r = 0; r < rules.length; r++) {
          var specificity = [ 0, 0, 0, 0 ];
          var selectorText = selectors[r];

          // *
          selectorText = selectorText.replace('*', '');
         
          // #id
          selectorText = selectorText.replace(/#[A-Za-z0-9_\-]+/g, function() {
            specificity[1]++;
            return '';
          });

          // .class
          selectorText = selectorText.replace(/\.[A-Za-z0-9_\-]+/g, function() {
            specificity[2]++;
            return '';
          });

          // [a=b]
          selectorText = selectorText.replace(/\[.*?\]/g, function() {
            specificity[2]++;
            return '';
          });

          // HTMLElements
          selectorText.replace(/a|abbr|acronym|address|applet|area|article|aside|audio|b|base|basefont|bdi|bdo|bgsound|big|blink|blockquote|body|br|button|canvas|caption|center|cite|code|col|colgroup|command|data|datalist|dd|del|details|dfn|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hgroup|hr|html|i|iframe|img|input|ins|isindex|kbd|keygen|label|legend|li|link|listing|map|mark|marquee|menu|meta|meter|nav|nobr|noframes|noscript|object|ol|optgroup|option|output|p|param|plaintext|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|source|spacer|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video|wbr|xmp|svg/g, function() {
            specificity[3]++;
            return '';
          });
         
          // Simply ignore the :pseudo 

          rules[r].specificity = specificity;
        }

        // Stable sorting of rules by ascending specificity (we implement
        // our own selection sort because we need it to be stable); the
        // sort must be stable to ensure that the rule that comes later
        // will be used when when two rules have the same specificity
        for (var i = 0; i < rules.length; i++) {
          var min = i;
          for (var j = i+1; j < rules.length; j++) {
            for (var k = 0; k < 3; k++) {
              if (rules[min].specificity[k] > rules[j].specificity[k]) {
                min = j;
              }
            }
          }
          if (min != i) {
            var temp = rules[i];
            rules[i] = rules[min];
            rules[min] = temp;
          }
        }

        // Preserve strict ordering of the rules, because rules like "font"
        // may override a "font-size" rule that comes later; this is done 
        // by filling the array in backwards and concatenating the inline
        // style in that order as well
        var propertyValues = { };
        for (var r = rules.length-1; r >= 0; r--) {
          var rule = rules[r];
          if (!rule.style) continue;
          
          for (var s = 0; s < rule.style.length; s++) {
            var property = rule.style[s];
            var value = rule.style.getPropertyValue(property);
            var priority = rule.style.getPropertyPriority(property);

            if (priority == 'important') {
              value += ' !important';
            } else if (property in propertyValues) {
              // Ignore properties since we are going backwards
              continue;
            }
            propertyValues[property] = value;
          }
        }

        // TODO: Compile border, padding, margin, etc. to shorthand
        var style = "";
        for (var property in propertyValues) {
          // Remember that the properties are added "backwards"
          style = property + ':' + propertyValues[property] + ';' + style;
        }

        // Attach the inline style to the existing inline style
        if (style.length > 0) {
          var existingStyle = element.getAttribute('style');
          if (existingStyle) {
            style += existingStyle;
          }
          element.setAttribute('style', style);
        }

        // Remove the class attribute
        element.removeAttribute('class');
      }
      
      // Remove the stylesheets from the page
      for (var i = styleSheets.length-1; i >= 0; i--) {
        var styleNode = styleSheets[i].ownerNode;
        styleNode.parentNode.removeChild(styleNode);
      }

      // Render the new HTML
      var html = document.documentElement.outerHTML;

      // Include the DOCTYPE if it exists
      var doctype = document.doctype;
      if (doctype) {
        html = "<!DOCTYPE " + doctype .name
          + (doctype.publicId ? ' PUBLIC "' + doctype.publicId + '"' : '')
          + (!doctype.publicId && doctype.systemId ? ' SYSTEM' : '') 
          + (doctype.systemId ? ' "' + doctype.systemId + '"' : '')
          + '>\n' + html;
      }

      return html;
    });

    console.log(html);
  }
  phantom.exit();
});


