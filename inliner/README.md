CSS Inliner
===========

Inlines CSS styles from the stylesheets into their DOM elements using [Phantom.js](http://phantomjs.org). The most obvious use case is sending HTML emails (because email clients tend to remove all the non-inline styles).


Instructions
------------

1. Install [Phantom.js](http://phantomjs.org/download.html)
2. Running ```phantomjs inliner.js index.html``` prints the resulting HTML document on ```stdout```
3. Run ```phantomjs inline.js index.html > inline.html``` to save to ```inline.html```

