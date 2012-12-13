/**
 * jQuery-Slideshow v0.1.0
 *
 * Image slideshow with pluggable transition effects.Distributed under the 
 * terms of the MIT License.
 *
 * http://slideshow.hackyon.com
 */
(function($) {
// TODO: Resizable viewport
// TODO: Do not block transitions to wait for img.onload()
// TODO: Special fullscreen mode

  var Grid = function(boxWidth, boxHeight, background) {
    this.boxWidth  = boxWidth;
    this.boxHeight = boxHeight;
    this.background = background || 'transparent';
  }

  Grid.prototype.attach = function($viewport, $image, src) {
    var rows = $viewport.height() / this.boxHeight;
    var cols = $viewport.width()  / this.boxWidth;

    var offsets = {
      'left': parseInt($image.css('left')),
      'top':  parseInt($image.css('top')),
      'width':  parseInt($image.css('width')), 
      'height': parseInt($image.css('height')),
    };

    var $container = $('<div/>');
    $container.css({
      'position': 'relative',
      'z-index': '2'
    });

    var grid = [];
    for (var x = 0; x < cols; x++) {
      grid[x] = [];

      var width  = this.boxWidth;
      if (x+1 > cols) {
        width = $viewport.width() % this.boxWidth;
      }
      for (var y = 0; y < rows; y++) {
        var $box = $('<div/>');

        var height = this.boxHeight;
        if (y+1 > rows) {
          height = $viewport.height() % this.boxHeight;
        }

        $box.css({
          'width':  width  + 'px',
          'height': height + 'px',
          'position': 'absolute',
          'top':  (y * this.boxHeight) + 'px',
          'left': (x * this.boxWidth)  + 'px',
          'background': this.background,
          'overflow': 'hidden'
        });
        
        var $inside = $('<div/>');
        $inside.addClass('inside');
        $inside.css({
          'width':  width + 'px',
          'height': height + 'px',
          'overflow': 'hidden'
        });
        
        var $image = $('<img/>');
        $image.css({
          'width':  offsets.width  + 'px',
          'height': offsets.height + 'px',
          'margin-top':  -(y * this.boxHeight) + offsets.top  + 'px',
          'margin-left': -(x * this.boxWidth)  + offsets.left + 'px'
        });
        $image.attr('src', src);
        $inside.append($image);
        $box.append($inside);

        grid[x][y] = $box;
        $container.append($box);
      }
    }
    
    $viewport.append($container);

    this.boxes = grid;
    this.n = cols * rows;
    this.src = src;
    this.$container = $container;
    this.$viewport = $viewport;
  };
  Grid.prototype.destroy = function() {
    this.$container.remove();
    this.boxes = null;
  };

  var Circles = function(thickness) {
    this.thickness = thickness;
  }

  Circles.prototype.attach = function($viewport, $image, src) {
    var viewportWidth  = $viewport.width();
    var viewportHeight = $viewport.height();

    var diagonal = Math.sqrt(Math.pow(viewportWidth/2, 2) + Math.pow(viewportHeight/2, 2));
    var n = Math.ceil(diagonal / this.thickness);

    var offsets = {
      'left': parseInt($image.css('left')),
      'top':  parseInt($image.css('top')),
      'width':  parseInt($image.css('width')), 
      'height': parseInt($image.css('height')),
    };

    var $container = $('<div/>');
    $container.css({
      'position': 'relative',
      'z-index': '2'
    });

    var centerX = viewportWidth  / 2;
    var centerY = viewportHeight / 2;

    var rings = [];
    for (var i = 1; i <= n; i++) {
      var dimension = this.thickness * i * 2;

      var $ring = $('<div/>');

      $ring.css({
        'width':  dimension + 'px',
        'height': dimension + 'px',
        'position': 'absolute',
        'z-index': (n-i+1),
        'top':  (centerY - dimension/2) + 'px',
        'left': (centerX - dimension/2)  + 'px',
        'background': 'transparent',
        'overflow': 'hidden'
      });

      var $inside = $('<div/>');
      $inside.addClass('inside');
      $inside.css({
        'width':  dimension + 'px',
        'height': dimension + 'px',
        'border-radius': '9999px',
        'overflow': 'hidden'
      });
      
      var $image = $('<img/>');
      $image.css({
        'width':  offsets.width  + 'px',
        'height': offsets.height + 'px',
        'margin-top':  -(centerY - dimension/2) + offsets.top  + 'px',
        'margin-left': -(centerX - dimension/2) + offsets.left + 'px'
      });
      $image.attr('src', src);
      $inside.append($image);
      $ring.append($inside);

      rings.push($ring);
      $container.append($ring);
    }
    
    $viewport.append($container);

    this.rings = rings;
    this.n = n;
    this.src = src;
    this.$container = $container;
    this.$viewport = $viewport;
  };
  Circles.prototype.destroy = function() {
    this.$container.remove();
    this.rings = null;
  };
 

  var StripsBiHorizontalTransition = function(config, duration) {
    this.boxWidth   = config.boxWidth;
    this.boxHeight  = config.boxHeight;
    this.background = config.background;

    this.duration = duration || 1000;
  };
  StripsBiHorizontalTransition.prototype.computeDuration = function($viewport, $image) {
    return this.duration;
  };
  StripsBiHorizontalTransition.prototype.run = function($viewport, $image, offsets, current, next) {
    var viewportWidth  = $viewport.width();
    var viewportHeight = $viewport.height();

    var cols = viewportWidth  / this.boxWidth;
    var rows = viewportHeight / this.boxHeight;

    var grid = new Grid(this.boxWidth, this.boxHeight, this.background);
    grid.attach($viewport, $image, current);
    
    setTimeout(function() {
      $image.css(offsets).attr('src', next);
    }, 0);

    var shiftWidth = parseInt($viewport.width());
    var step = 0.75 * this.duration / rows;

    var counter = 0;
    for (var x = 0; x < cols; x++) {
      for (var y = 0; y < rows; y++) {
        var sign = (y % 2 !== 0) ? 1 : -1;

        var durationOffset = y * step;

        var $box = grid.boxes[x][y];
        var left = parseInt($box.css('left'));
        $box.delay(durationOffset).animate(
          { 
            'left': left + (sign * shiftWidth) + 'px',
            'opacity': 0
          }, 
          this.duration - durationOffset, 
          function() { 
            counter += 1;
            if (counter >= grid.n) {
              // Destroy the grid after the transition
              grid.destroy();
            }
          });
      }
    }
  };

  var StripsVerticalTransition = function(config, duration) {
    this.boxWidth   = config.boxWidth;
    this.boxHeight  = config.boxHeight;
    this.background = config.background;

    this.duration = duration || 1000;
  };
  StripsVerticalTransition.prototype.computeDuration = function($viewport, $image) {
    return this.duration;
  };
  StripsVerticalTransition.prototype.run = function($viewport, $image, offsets, current, next) {
    var viewportWidth  = $viewport.width();
    var viewportHeight = $viewport.height();

    var cols = viewportWidth  / this.boxWidth;
    var rows = viewportHeight / this.boxHeight;

    var grid = new Grid(this.boxWidth, this.boxHeight, this.background);
    grid.attach($viewport, $image, current);
    setTimeout(function() {
      $image.css(offsets).attr('src', next);
    }, 0);

    var shiftHeight = parseInt($viewport.height());
    var duration = this.duration / 2;

    var counter = 0;
    for (var x = 0; x < cols; x++) {
      for (var y = 0; y < rows; y++) {
        var durationOffset = 0.5 * (x / cols) * this.duration;

        var $box = grid.boxes[x][y];
        var top = parseInt($box.css('top'));
        $box.delay(durationOffset).animate(
          { 
            'top': (top + shiftHeight) + 'px',
            'opacity': 0
          }, 
          duration,
          function() { 
            counter += 1;
            if (counter >= grid.n) {
              // Destroy the grid after the transition
              grid.destroy();
            }
          });
      }
    }
  };


  var FadingColumnsTransition = function(config, duration) {
    this.boxWidth   = config.boxWidth;
    this.boxHeight  = config.boxHeight;
    this.background = config.background;

    this.duration = duration || 1000;
  };
  FadingColumnsTransition.prototype.computeDuration = function($viewport, $image) {
    return this.duration;
  };
  FadingColumnsTransition.prototype.run = function($viewport, $image, offsets, current, next) {
    var viewportWidth  = $viewport.width();
    var viewportHeight = $viewport.height();

    var cols = viewportWidth  / this.boxWidth;
    var rows = viewportHeight / this.boxHeight;

    var wait = (this.duration - 300) / (rows+1) / cols;

    var grid = new Grid(this.boxWidth, this.boxHeight, this.background);
    grid.attach($viewport, $image, current);

    setTimeout(function() {
      $image.css(offsets).attr('src', next);
    }, 0);

    var counter = 0;
    for (var x = 0; x < cols; x++) {
      for (var y = 0; y < rows; y++) {
        var time = (y + rows * x) * wait;
        var $box = grid.boxes[x][y];

        $box.delay(time).fadeOut(300, function() {
          // Destroy the grid after the transition
          counter += 1;
          if (counter >= grid.n) {
            grid.destroy();
          }
        });
      }
    }
  };

  var BlindsTransition = function(config, duration) {
    this.boxWidth   = config.boxWidth;
    this.boxHeight  = config.boxHeight;
    this.background = config.background;

    this.duration = duration || 1000;
  };
  BlindsTransition.prototype.computeDuration = function($viewport, $image) {
    return this.duration;
  };
  BlindsTransition.prototype.run = function($viewport, $image, offsets, current, next) {
    var viewportWidth  = $viewport.width();
    var viewportHeight = $viewport.height();

    var cols = viewportWidth  / this.boxWidth;
    var rows = viewportHeight / this.boxHeight;

    var grid = new Grid(this.boxWidth, this.boxHeight, this.background);
    grid.attach($viewport, $image, current);

    setTimeout(function() {
      $image.css(offsets).attr('src', next);
    }, 0);

    var counter = 0;
    for (var x = 0; x < cols; x++) {
      for (var y = 0; y < rows; y++) {
        var $box = grid.boxes[x][y];

        $box.animate({ 'text-indent': 90 }, {
          step: function(now, fx) {
            $(this).css({
              '-webkit-transform': 'rotateY(' + now + 'deg)',
              '-moz-transform':    'rotateY(' + now + 'deg)',
              '-o-transform':      'rotateY(' + now + 'deg)',
              'transform':         'rotateY(' + now + 'deg)'
            });
          },
          duration: this.duration
        });
      }
    }

    setTimeout(function() {
      // Destroy the grid after the transition
      grid.destroy();
    }, this.duration);
  };

  var ShrinkingBlocksTransition = function(config, duration) {
    this.boxWidth   = config.boxWidth;
    this.boxHeight  = config.boxHeight;
    this.background = config.background;

    this.duration = duration || 1000;
  };
  ShrinkingBlocksTransition.prototype.computeDuration = function($viewport, $image) {
    return this.duration;
  };
  ShrinkingBlocksTransition.prototype.run = function($viewport, $image, offsets, current, next) {
    var viewportWidth  = $viewport.width();
    var viewportHeight = $viewport.height();

    var cols = viewportWidth  / this.boxWidth;
    var rows = viewportHeight / this.boxHeight;

    var wait = (this.duration - 300) / rows / (cols+1);

    var grid = new Grid(this.boxWidth, this.boxHeight, this.background);
    grid.attach($viewport, $image, current);

    setTimeout(function() {
      $image.css(offsets).attr('src', next);
    }, 0);

    for (var x = 0; x < cols; x++) {
      for (var y = 0; y < rows; y++) {
        var time = (y * cols + x) * wait;
        var $box = grid.boxes[x][y];

        $box.delay(time).animate({ opacity: 0 }, {
          step: function(now, fx) {
            $(this).css({
              '-webkit-transform': 'scale(' + (0.75 + 0.25 * now) + ')',
              '-moz-transform':    'scale(' + (0.75 + 0.25 * now) + ')',
              '-o-transform':      'scale(' + (0.75 + 0.25 * now) + ')',
              'transform':         'scale(' + (0.75 + 0.25 * now) + ')'
            });
          },
          duration: 300
        });
      }
    }

    setTimeout(function() {
      // Destroy the grid after the transition
      grid.destroy();
    }, this.duration);
  };

  var ShrinkingCirclesTransition = function(config, duration) {
    this.boxWidth   = config.boxWidth;
    this.boxHeight  = config.boxHeight;
    this.background = config.background;

    this.duration = duration || 1000;
  };
  ShrinkingCirclesTransition.prototype.computeDuration = function($viewport, $image) {
    return this.duration;
  };
  ShrinkingCirclesTransition.prototype.run = function($viewport, $image, offsets, current, next) {
    var viewportWidth  = $viewport.width();
    var viewportHeight = $viewport.height();

    var cols = viewportWidth  / this.boxWidth;
    var rows = viewportHeight / this.boxHeight;

    var wait = (this.duration - 300) / rows / (cols+1);

    var grid = new Grid(this.boxWidth, this.boxHeight, this.background);
    grid.attach($viewport, $image, current);

    setTimeout(function() {
      $image.css(offsets).attr('src', next);
    }, 0);

    var radius = 4 * Math.max(this.boxHeight, this.boxWidth);

    for (var x = 0; x < cols; x++) {
      for (var y = 0; y < rows; y++) {
        var time = (y * cols + x) * wait;
        var $box = grid.boxes[x][y];
        var $inside = $box.find('.inside');

        $inside.delay(time).animate({ 
          'border-radius': radius,
          'margin-top': this.boxHeight/2,
          'margin-left': this.boxWidth/2,
          'width': '0',
          'height': '0'
        }, 300);
      }
    }

    setTimeout(function() {
      // Destroy the grid after the transition
      grid.destroy();
    }, this.duration);
  };


  var DissolveTransition = function(config, duration) {
    this.boxWidth   = config.boxWidth;
    this.boxHeight  = config.boxHeight;
    this.background = config.background;

    this.duration = duration || 1000;
  };
  DissolveTransition.prototype.computeDuration = function($viewport, $image) {
    return this.duration;
  };
  DissolveTransition.prototype.run = function($viewport, $image, offsets, current, next) {

    var $back = $('<img/>');
    $back.attr('src', next);
    $back.css({
      'position': 'absolute'
    }).css(offsets);

    $viewport.append($back);
    $image.fadeOut(this.duration, function() {
      $image.css(offsets).attr('src', next).show();
      $back.remove();
    });
  };

  var SlideLeftTransition = function(config, duration) {
    this.boxWidth   = config.boxWidth;
    this.boxHeight  = config.boxHeight;
    this.background = config.background;

    this.duration = duration || 1000;
  };
  SlideLeftTransition.prototype.computeDuration = function($viewport, $image) {
    return this.duration;
  };
  SlideLeftTransition.prototype.run = function($viewport, $image, offsets, current, next) {

    var $slide = $('<div/>');
    $slide.css({
      'position': 'absolute',
      'top': '0',
      'left': $viewport.width(),
      'width': $viewport.width(),
      'height': $viewport.height(),
      'overflow': 'hidden',
      'z-index': '2'
    });

    var $slideImage = $('<img/>');
    $slideImage.attr('src', next);
    $slideImage.css('position', 'absolute').css(offsets);

    $slide.append($slideImage);
    $viewport.append($slide);

    var left = parseInt($image.css('left')) - $viewport.width();

    $slide.animate({ 'left': 0 }, this.duration);
    $image.animate({ 'left': left }, this.duration, 
      function() {
        $image.css(offsets).attr('src', next);
        $slide.remove();
      }
    );
  };

  var RotatingCirclesTransition = function(config, duration) {
    this.circleThickness = config.circleThickness;
    this.background = config.background;

    this.duration = duration || 1000;
  };
  RotatingCirclesTransition.prototype.computeDuration = function($viewport, $image) {
    return this.duration;
  };
  RotatingCirclesTransition.prototype.run = function($viewport, $image, offsets, current, next) {
    var circles = new Circles(this.circleThickness);
    circles.attach($viewport, $image, current);
    
    setTimeout(function() {
      $image.css(offsets).attr('src', next);
    }, 0);

    var createStep = function(sign) {
      return function(now, fx) {
        $(this).css({
          '-webkit-transform': 'rotate(' + (sign * (1-now) * 45) + 'deg)',
          '-moz-transform':    'rotate(' + (sign * (1-now) * 45) + 'deg)',
          '-o-transform':      'rotate(' + (sign * (1-now) * 45) + 'deg)',
          'transform':         'rotate(' + (sign * (1-now) * 45) + 'deg)'
        });
      };
    };

    for (var i = 0; i < circles.n; i++) {
      var $circle = circles.rings[i];
      var sign  = (i%2 === 0)? 1 : -1;
      var delay = (1-i/circles.n) * 700;

      $circle.delay(delay).animate({ opacity: 0 }, {
        duration: 300,
        step: createStep(sign)
      });
    }

    setTimeout(function() {
      // Destroy the grid after the transition
      circles.destroy();
    }, this.duration);
  };


  /**
   * Compute offset of the image based on overflow type
   */ 
  var computeOffsets = function(image, $viewport, config) {
    var imageWidth  = image.width;
    var imageHeight = image.height;
    var imageRatio  = imageWidth / imageHeight;

    var viewportWidth  = $viewport.width();
    var viewportHeight = $viewport.height();
    var viewportRatio  = viewportWidth / viewportHeight;

    var top  = 0;
    var left = 0;
    var width  = viewportWidth;
    var height = viewportHeight;

    if (config.overflow === 'pad') { // Pad
      if (imageRatio > viewportRatio) { // Top and Bottom
        width  = viewportWidth;
        height = viewportWidth / imageRatio;
        top    = (viewportHeight - height) / 2;
        left   = 0;
      } else { // Left and Right
        width  = viewportHeight * imageRatio;
        height = viewportHeight;
        top    = 0;
        left   = (viewportWidth - width) / 2;
      }

    } else if (config.overflow === 'crop') { // Crop
      if (imageRatio > viewportRatio) { // Left and Right
        width  = viewportHeight * imageRatio;
        height = viewportHeight;
        top    = 0;
        left   = (viewportWidth - width) / 2;
      } else { // Top and Bottom 
        width  = viewportWidth;
        height = viewportWidth / imageRatio;
        top    = (viewportHeight - height) / 2;
        left   = 0;
      }
    } else { // Original
      width  = imageWidth;
      height = imageHeight;
      top  = (viewportHeight - height) / 2;
      left = (viewportWidth  - width)  / 2;
    }
    return { 
      'top':    Math.round(top),
      'left':   Math.round(left), 
      'width':  Math.round(width), 
      'height': Math.round(height) 
    };
  };


  /**
   * Transitions from one slide to another.
   */
  var go = function($this, from, to, type) {
    type = type || null;

    // Wait for the current transition to finish if necessary
    var wait = $this.data('slideshow.transitioning');
    if (wait) {
      $this.data('slideshow.queue', { to: to, type: type });
      return;
    }

    var data   = $this.data('slideshow');
    var slides = data.slides;
    var config = data.config;
    var $viewport   = data.$viewport;
    var $image      = data.$image;
    var selectables = data.selectables;
    var transitions = data.transitions;
    var activeTransitions = data.activeTransitions;

    var current = slides[from].href;
    var next    = slides[to  ].href;

    var duration = 0;

    if (from !== to) {
      var draw = Math.floor(Math.random() * activeTransitions.length);
      var transition = transitions[activeTransitions[draw]];
      if (type && transitions[type]) {
        transition = transitions[type];
      } else if (slides[to].transition && transitions[slides[to].transition]) {
        transition = transitions[slides[to].transition];
      }

      var image = new Image();
      image.onload = function() {
        var offsets = computeOffsets(image, $viewport, config);
        transition.run($viewport, $image, offsets, current, next);
        $this.data('slideshow.index', to);
        selectables[from].removeClass('selected');
        selectables[to  ].addClass('selected');
      };
      image.src = next;
      $this.data('slideshow.start', -1);
      $this.data('slideshow.transitioning', true);

      duration = transition.computeDuration($viewport, $image);
    } else {
      duration = 0;
    }

    var timeout = $this.data('slideshow.timeout');
    if (timeout) {
      clearTimeout(timeout);
      $this.data('slideshow.timeout', null);
    }

    setTimeout(function() {
      var pause = $this.data('slideshow.pause');
      if (typeof pause === 'number') {
        $this.data('slideshow.pause', config.time);
      } else {
        var again = (to+1) % slides.length;
        var timeout = setTimeout(function() {
          go($this, to, again);
        }, config.time);
        $this.data('slideshow.timeout', timeout);
        $this.data('slideshow.start', +new Date());

        // Prefetch the next image
        var prefetch = new Image();
        prefetch.src = slides[again].href;
      }
      $this.data('slideshow.transitioning', false);

      var queue = $this.data('slideshow.queue');
      if (queue && (typeof queue.to === 'number')) {
        $this.data('slideshow.queue', null);
        go($this, to, queue.to, queue.type);
      }
    }, duration);
  };


  var methods = {
    init : function(options) {
      var config = $.extend({
        time: 3000,
        boxWidth: 50,
        boxHeight: 50,
        circleThickness: 50,
        overflow: 'original',
        progress: null,
        $thumbnails: null
      }, options);

      // Initialize the transitions based on config
      var transitions = {
        'FadingColumns':    new FadingColumnsTransition(config),
        'StripsBiHorizontal': new StripsBiHorizontalTransition(config),
        'StripsVertical': new StripsVerticalTransition(config),
        'Dissolve': new DissolveTransition(config),
        'SlideLeft': new SlideLeftTransition(config),
        'ShrinkingBlocks': new ShrinkingBlocksTransition(config),
        'ShrinkingCircles': new ShrinkingCirclesTransition(config),
        'RotatingCircles': new RotatingCirclesTransition(config),
        'Blinds': new BlindsTransition(config),
        //'SlideGradient': new SlideGradientTransition(config)
      };
      var activeTransitions = [ 
        'FadingColumns', 
        'StripsBiHorizontal',
        'StripsVertical',
        'Dissolve',
        'SlideLeft',
        'ShrinkingBlocks', 
        'ShrinkingCircles',
        'RotatingCircles',
        'Blinds',
        // TODO: 'SlideGradient',
      ];

      return this.each(function() {
        var $this = $(this);

        // Setup the viewport
        var $viewport = $this.find('.viewport');
        $viewport.css({ 
          'position': 'relative',
          'overflow': 'hidden'
        });

        var $image = $('<img/>');
        $image.css({
          'position': 'absolute',
          'top': '0',
          'left': '0',
          'z-index': '1',
          'width':  $viewport.width(),
          'height': $viewport.height()
        });
        $viewport.append($image);

        // Extract the slides
        var $thumbnails = config.$thumbnails;
        if (!$thumbnails) {
          $thumbnails = $this.find('.thumbnails');
        }

        var slides = [];
        var selectables = [];
        $thumbnails.find('li').each(function() {
          var $li  = $(this);
          var $a   = $li.find('a');
          var href = $a.attr('href'); 
          var transition = $a.data('transition');
          slides.push({
            href: href,
            transition: transition
          });
          var to = slides.length-1;
          $a.click(function(e) {
            e.preventDefault();
            var from = $this.data('slideshow.index');
            go($this, from, to);
          });
          selectables.push($li);
        });
        $this.data('slideshow.index', 0);
        selectables[0].addClass('selected');

        var data = {
          $viewport: $viewport,
          $image: $image,
          $thumbnails: $thumbnails,
          selectables: selectables,
          config: config,
          slides: slides,
          transitions: transitions,
          activeTransitions: activeTransitions
        };
        $this.data('slideshow', data);

        // Load the initial image
        var image = new Image();
        image.onload = function() {
          var offsets = computeOffsets(image, $viewport, config);
          $image.css('display', 'none')
                .css(offsets)
                .attr('src', slides[0].href)
                .fadeIn(500);

          // Setup the first transition
          var from = 0;
          var to   = (from+1) % slides.length;
          var timeout = setTimeout(function() {
            go($this, from, to);
          }, config.time);
          $this.data('slideshow.timeout', timeout);
          $this.data('slideshow.start', +new Date());
          $this.data('slideshow.transitioning', false);

          // Prefetch the next image
          var prefetch = new Image();
          prefetch.src = slides[to].href;

          // Progress Listener
          if (config.progress) {
            var cycle= function() {
              window.requestAnimFrame(cycle);

              var elapsed = 0;
              var pause = $this.data('slideshow.pause');
              if (typeof pause === 'number') {
                elapsed = config.time - pause;
              } else {
                var start = $this.data('slideshow.start');
                if (start > 0) {
                  elapsed = (+new Date()) - start;
                }
              }
              var percent = elapsed / config.time * 100;
              config.progress(percent);
            };
            cycle();
          }
        };
        image.src = slides[0].href;
      });
    },
    transition: function(target, transition) {
      return this.each(function() {
        var $this = $(this);

        var data   = $this.data('slideshow');
        var slides = data.slides;

        var from = $this.data('slideshow.index');
        var to   = null;
        if (typeof target === "number") {
          to = parseInt(target);
        } else {
          for (var i = 0; i < slides.length; i++) {
            if (slides[i].href === to) {
              to = i;
              break;
            }
          }
        }
        if (to === null) {
          return;
        }
        go($this, from, to, transition);
      });
    },
    pause: function() {
      return this.each(function() {
        var $this = $(this);

        var pause = $this.data('slideshow.pause');
        if (typeof pause === 'number') {
          return;
        }

        var data = $this.data('slideshow');
        var config = data.config;

        var timeout = $this.data('slideshow.timeout');
        if (timeout) {
          clearTimeout(timeout);
          $this.data('slideshow.timeout', null);
        }

        var remaining = config.time;

        var transitioning = $this.data('slideshow.transitioning');
        if (transitioning) {
          remaining = config.time;
        } else {
          // Save the remaining time
          var start   = $this.data('slideshow.start');
          var elapsed = (+new Date()) - start;
          remaining   = config.time - elapsed;
        }

        $this.data('slideshow.pause', remaining);
      });
    },
    start: function() {
      return this.each(function() {
        var $this = $(this);

        var data   = $this.data('slideshow');
        var config = data.config;

        var remaining = $this.data('slideshow.pause');
        if (typeof remaining !== 'number') {
          // Slideshow has not been paused
          return;
        }
        var elapsed = config.time - remaining;

        var data   = $this.data('slideshow');
        var slides = data.slides;
        var config = data.config;

        var index = $this.data('slideshow.index');
        var next  = (index+1) % slides.length;

        var timeout = setTimeout(function() {
          go($this, index, next);
        }, remaining);
        $this.data('slideshow.timeout', timeout);
        $this.data('slideshow.start', (+new Date()) - elapsed);

        $this.data('slideshow.pause', null);
      });
    }
  };

  // Animation frames from browser
  // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  window.requestAnimFrame = (function(){
      return window.requestAnimationFrame       || 
             window.webkitRequestAnimationFrame || 
             window.mozRequestAnimationFrame    || 
             window.oRequestAnimationFrame      || 
             window.msRequestAnimationFrame     || 
             function (callback) {
               window.setTimeout(callback, 1000 / 60); // Default to 60fps
             };
  })();

  $.fn.slideshow = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error ('No such method: ' + method);
    }
  };
  
})(jQuery);
