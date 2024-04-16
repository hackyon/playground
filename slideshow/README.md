[jQuery-Slideshow](https://hackyon.github.io/playground/slideshow/) - Open Source Slideshow for jQuery
==================

A jQuery plugin for an image slideshow. Experimenting with the transition effects available in similar slideshow libraries. The plugin comes with 10 transition. Feel free to implement your own as the source is freely available under the MIT license.


Getting Started
-----------------------------

Include the required jQuery (>1.8.2) dependency

```html
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"></script>
<script type="text/javascript" src="jquery.slideshow.js"></script>
``` 

Initialize the slideshow

```javascript
$("#slideshow").slideshow({
  overflow: 'crop',                   // Original, crop, or pad
  $thumbnails: $('#thumbnails'),      // Specifies the slideshow images
  progress: function(percent) {       // Progress listener
    $progress.css('width', percent + "%"); 
  }
});
$("#container").mouseover(function() { $("#slideshow").slideshow('pause'); // Pauses the slideshow
}).mouseout(function() {
  $("#slideshow").slideshow('start'); // Resumes the slideshow
});
```

Use the thumbnails list to configure the images in the slideshow. The full-size image shown in the slideshow is fetched from the corresponding ```href``` attribute. 

```html
<ul id="thumbnails">
  <li><a href="images/originals/1.jpg" data-transition="StripsBiHorizontal"><img src="images/thumbnails/1.jpg"/></a></li>
  <li><a href="images/originals/2.jpg"><img src="images/thumbnails/2.jpg"/></a></li>
  <li><a href="images/originals/3.jpg"><img src="images/thumbnails/3.jpg"/></a></li>
  <li><a href="images/originals/4.jpg"><img src="images/thumbnails/4.jpg"/></a></li>
  <li><a href="images/originals/5.jpg"><img src="images/thumbnails/5.jpg"/></a></li>
</ul>
```

The ```data-transition``` attribute may be used to force the use of a specific transition (when transitioning to that particular image).


Contributions
-----------------------------
Contributions and suggestions are welcomed. I will promote this library to its own repo if others are interested in contributing (so please let me know if you're interested). 


License
-----------------------------
The source is freely available under the terms of the MIT License.  

Feel free to download, modify, and use for personal or commercial projects. I would appreciate a pingback if you find the project useful, but it's certainly not required.


