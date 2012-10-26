/**
 * jQuery HoverScroll v0.1.0
 *
 * Scrolls a horizontal list on hover. The amount of scroll is computed
 * based on the x position of the mouse with respect to width of the list.
 *
 * Distributed under the terms of the MIT License
 * Copyright (c) 2012 Donald Lau (badassdon)
 */
(function($) {
  // TODO: Mobile support
  // TODO: Smooth custom 'animation' for scrollLeft (should not use jQuery animation since the scroll is constantly changing)

  var methods = {
    init : function(options) {
      var config = $.extend({
        margin: 2,   // The spacing between list items
        padding: 50, // The horizontal padding to exclude from scrolling
        delay: 300   // The delay before recomputation of resize event
      }, options);

      this.data('config', config);

      return this.each(function() {
        var $this = $(this);

        // Force styles onto the list
        $this.css({
          'overflow': 'hidden',
          'margin': '0',
          'padding': '0',
          'list-style-type': 'none',
          'position': 'relative'
        });

        $this.children().css({
          'display': 'block',
          'position': 'absolute'
        }); 

        // Measurements for computing scroll
        var containerWidth  = 0;
        var containerOffset = { };
        var contentWidth    = 0;
        var scrollWidth     = 0;
        
        function recompute() {
          var contentHeight = $this.height();
          var computeHeight = (contentHeight <= 0); // Compute if no height

          containerWidth = $this.width();

          contentWidth = 0;
          $this.children().each(function(i) {
            $(this).css('left', contentWidth + i * config.margin);
            
            var width  = $(this).width();
            if (width > 0) {
              contentWidth += width;
            } else {
              $(this).children().each(function(j) {
                contentWidth += $(this).width();
              });
            }

            if (computeHeight) {
              var height = $(this).height();
              if (height > 0) {
                contentHeight = Math.max(contentHeight, height);
              } else {
                $(this).children().each(function(j) {
                  contentHeight = Math.max(contentHeight, $(this).height());
                });
              }
            }
          });

          scrollWidth = Math.max(0, contentWidth - containerWidth);
          
          containerOffset = $this.offset();

          $this.css('height', contentHeight);
        };
        recompute();

        // Attach mouse move events
        $this.mousemove(function(e) {
          var offsetX = e.pageX - containerOffset.left;
          var percent = (offsetX - config.padding) / (containerWidth - 2*config.padding);
          percent = Math.max(0, Math.min(percent, 100));
          $this.scrollLeft(percent * scrollWidth);
        });

        // Recompute on resize event
        var delay = null;
        $this.resize(function(e) {
          // Delayed computation (wait for final event)
          if (delay) clearTimeout(delay);
          delay = setTimeout(recompute, config.delay);
        });
      });
    }
  };

  $.fn.hoverScroll = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method == 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error ('No such method: ' + method);
    }
  };

})(jQuery);
