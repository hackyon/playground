/**
 * HTML5 Canvas ImageFilters v0.1.0 - 2012-10-25
 * http://www.hackyon.com/playground/filters 
 * 
 * Copyright (c) 2012 Donald Lau (badassdon); Licensed MIT
 */

(function(scope) {
  /**
   * Filters are namespaced inside a ImageFilterContext.
   */
  var Context = function() {
  };

  /**
   * Filters and masks are applied by connecting nodes in a series.
   * Functions are attached as mixins.
   */
  var Node = (function() {
    function connect(node, x, y) {
      if (!this._nextNodes) this._nextNodes = [];
      this._nextNodes.push(node);
      this._x = x || 0;
      this._y = y || 0;
    }
    function render(imageData) {
      if (!this._nextNodes) return;
      for (var i = 0; i < this._nextNodes.length; i++) {
        var node = this._nextNodes[i];
        node.render(imageData, this);
      }
    }
    function clamp(color) {
      return Math.max(Math.min(color, 255), 0);
    }
  
    return function() {
      this.connect  = connect;
      this.render   = render;
      this._next    = render;
      this.clamp    = clamp;
      return this;
    };
  })();
  
  /**
   * Data source for an image.
   */
  var Source = function() { 
  };
  Node.call(Source.prototype);
  
  Source.prototype.render = function() {
    var self = this;
    
    var image = new Image();
    image.onload = function() {
      var canvas = document.createElement('canvas');
      canvas.setAttribute('width',  image.width);
      canvas.setAttribute('height', image.height);
  
      var context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      var imageData = context.getImageData(0, 0, image.width, image.height);
  
      self._next(imageData);
    };
    image.src = self.url;
  };
  
  Context.prototype.createSource = function() {
    return new Source();
  };
  
  /**
   * Conversion between RGB and CYMK. Functions are available as mixins.
   */
  var CMYKConverter = (function() {
    function convertToCMYK(imageData) {
      // The alpha is ignored
      var buffer = new ArrayBuffer(imageData.data.length * 4);
      var cmyk   = new Float32Array(buffer);
      for (var i = 0; i < imageData.data.length; i += 4) {
        var r = imageData.data[i];
        var g = imageData.data[i+1];
        var b = imageData.data[i+2];
  
        var c = 1 - (r/255);
        var m = 1 - (g/255);
        var y = 1 - (b/255);
  
        var k = Math.min(c, m, y);
        cmyk[i  ] = (c-k)/(1-k)*100;
        cmyk[i+1] = (m-k)/(1-k)*100;
        cmyk[i+2] = (y-k)/(1-k)*100;
        cmyk[i+3] = k*100; 
      }
      return cmyk;
    }
    function convertToRGB(cmyk, imageData) {
      for (var i = 0; i < cmyk.length; i += 4) {
        var c = cmyk[i]  /100;
        var m = cmyk[i+1]/100;
        var y = cmyk[i+2]/100;
        var k = cmyk[i+3]/100;
  
        imageData.data[i]   = Math.round(255*(1-((c*(1-k))+k)));
        imageData.data[i+1] = Math.round(255*(1-((m*(1-k))+k)));
        imageData.data[i+2] = Math.round(255*(1-((y*(1-k))+k)));
      }
      return imageData;
    }
  
    return function() {
      this.convertToCMYK = convertToCMYK;
      this.convertToRGB  = convertToRGB;
    };
  })();
  
  /**
   * Layer to compose and position multiple sources.
   */
  var Layer = function() {
    this.width  = 0;
    this.height = 0;
    this.canvas = null;
  };
  Node.call(Layer.prototype);
  
  Layer.prototype.render = function(imageData, source) {
    var canvas = this.canvas;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.setAttribute('width',  this.width);
      canvas.setAttribute('height', this.height);
      this.canvas = canvas;
    } else {
      this.width  = canvas.width;
      this.height = canvas.height;
    }
  
    var x = source._x || 0;
    var y = source._y || 0;
  
    var context = canvas.getContext('2d');
    context.putImageData(imageData, x, y);
  
    var data = context.getImageData(0, 0, this.width, this.height);
    this._next(data);
  };
  
  Context.prototype.createLayer = function() {
    return new Layer();
  };
  
  /**
   * Creates a mask using a canvas.
   */
  var CanvasMask = function() {
    this.offsetX = 0;
    this.offsetY = 0;
    this.canvas = null;
  };
  Node.call(CanvasMask.prototype);
  
  CanvasMask.prototype.render = function(imageData) {
    if (!this.canvas) {
      this._next(imageData);
      return;
    }
  
    var canvas  = this.canvas;
    var context = canvas.getContext('2d');
    var mask = context.getImageData(0, 0, canvas.width, canvas.height);
  
    for (var x = 0; x < mask.width; x++) {
      for (var y = 0; y < mask.height; y++) {
        var i = (x + y * mask.width) * 4;
  
        var targetX = this.offsetX + x;
        var targetY = this.offsetY + y;
        if (targetX >= imageData.width || targetY >= imageData.height) continue;
  
        // The mask is based on the alpha value 
        var j = (targetX + targetY * imageData.width) * 4;
        if (imageData.data[j+3] !== 0) {
          imageData.data[j+3] = mask.data[i+3];
        }
      }
    }
    this._next(imageData);
  };
  
  Context.prototype.createCanvasMask = function() {
    return new CanvasMask();
  };
  
  var SaturationFilter = function() {
    this.value = 0; // Desaturate with value of -1
  };
  Node.call(SaturationFilter.prototype);
  
  SaturationFilter.AVERAGE = function(r, g, b) {
    return (r+g+b)/3;
  };
  SaturationFilter.LIGHTNESS = function(r, g, b) {
    return 0.5 * (Math.max(r,g,b) + Math.min(r,g,b));
  };
  SaturationFilter.LUMINOSITY = function(r, g, b) {
    return (r*0.2125 + g*0.7154 + b*0.0721); 
  };
  
  SaturationFilter.prototype.render = function(imageData) {
    var compute = SaturationFilter.AVERAGE;
  
    for (var i = 0; i < imageData.data.length; i += 4) {
      var r = imageData.data[i];
      var g = imageData.data[i+1];
      var b = imageData.data[i+2];
  
      var gray = compute(r, g, b);
  
      imageData.data[i]   = this.clamp(r + (r - gray) * this.value);
      imageData.data[i+1] = this.clamp(g + (g - gray) * this.value);
      imageData.data[i+2] = this.clamp(b + (b - gray) * this.value);
    }
  
    this._next(imageData);
  };
  
  Context.prototype.createSaturationFilter = function() {
    return new SaturationFilter();
  };
  
  var BrightnessFilter = function() {
    this.value = 0;
  };
  Node.call(BrightnessFilter.prototype);
  
  BrightnessFilter.prototype.render = function(imageData) {
    for (var i = 0; i < imageData.data.length; i += 4) {
      var r = imageData.data[i];
      var g = imageData.data[i+1];
      var b = imageData.data[i+2];
  
      imageData.data[i]   = Math.min(r + this.value, 255);
      imageData.data[i+1] = Math.min(g + this.value, 255);
      imageData.data[i+2] = Math.min(b + this.value, 255);
    }
    this._next(imageData);
  };
  
  Context.prototype.createBrightnessFilter = function() {
    return new BrightnessFilter();
  };
  
  var ContrastFilter = function() {
    this.multiplier = 1;
  };
  Node.call(ContrastFilter.prototype);
  
  ContrastFilter.prototype.render = function(imageData) {
    for (var i = 0; i < imageData.data.length; i += 4) {
      var r = imageData.data[i];
      var g = imageData.data[i+1];
      var b = imageData.data[i+2];
  
      imageData.data[i]   = this.clamp((r - 128) * this.multiplier + 128);
      imageData.data[i+1] = this.clamp((g - 128) * this.multiplier + 128);
      imageData.data[i+2] = this.clamp((b - 128) * this.multiplier + 128);
    }
    this._next(imageData);
  };
  
  Context.prototype.createContrastFilter = function() {
    return new ContrastFilter();
  };
  
  var SepiaFilter = function() {
    this.depth = 8;
    this.intensity = 18;
  };
  Node.call(SepiaFilter.prototype);
  
  SepiaFilter.prototype.render = function(imageData) {
    for (var i = 0; i < imageData.data.length; i += 4) {
      var r = imageData.data[i];
      var g = imageData.data[i+1];
      var b = imageData.data[i+2];
  
      var gray = (r+g+b)/3;
      r = g = b = gray;
      
      r = Math.min(r + this.depth*2, 255);
      g = Math.min(g + this.depth, 255);
      b = Math.max(b - this.intensity, 0);
  
      imageData.data[i]   = r;
      imageData.data[i+1] = g;
      imageData.data[i+2] = b;
    }
    this._next(imageData);
  };
  
  Context.prototype.createSepiaFilter = function() {
    return new SepiaFilter();
  };
  
  scope.ImageFilterContext = Context;
})(window);
