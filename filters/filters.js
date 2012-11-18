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
  
    return function() {
      this.connect  = connect;
      this.render   = render;
      this._next    = render;
      return this;
    };
  })();
  
  /**
   * Various ways of computing luminance.
   */
  var Light = function() {
  };
  
  Light.average = function(r, g, b) {
    return (r+g+b)/3;
  };
  Light.lightness = function(r, g, b) {
    return 0.5 * (Math.max(r,g,b) + Math.min(r,g,b));
  };
  Light.luminosity = function(r, g, b) {
    return (r*0.2125 + g*0.7154 + b*0.0721); 
  };
  
  
  /**
   * Histogram of the image data.
   */
  var Histogram = function() {
  };
  
  Histogram.compute = function(imageData) {
    var histogram = new Float32Array(256);
    var max = 0;
   
    for (var i = 0; i < imageData.data.length; i += 4) {
      var r = imageData.data[i];
      var g = imageData.data[i+1];
      var b = imageData.data[i+2];
  
      var luminosity = Math.round(Light.lightness(r, g, b));
      histogram[luminosity] += 1;
      max = Math.max(max, histogram[luminosity]);
    }
  
    // Normalize based on the max
    for (var j = 0; j < histogram.length; j += 1) {
      histogram[j] = histogram[j] / max;
    }
    return histogram;
  };
  
  Histogram.draw = function(histogram, canvas) {
    // Debugging
    var context = canvas.getContext('2d');
    var width   = canvas.width/256;
    var height  = canvas.height;
  
    for (var i = 0; i < histogram.length; i += 1) {
      context.fillRect(i * width, height, width, -height*(1-histogram[i]));
    }
  };
  
  /**
   * Conversion between RGB and CYMK.
   */
  var CMYK = function() {
  };
  
  CMYK.convertRGBtoCMYK = function(imageData) {
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
  };
  
  CMYK.convertCMYKtoRGB = function(cmyk, imageData) {
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
  };
  
  /**
   * Conversion between RGB and YIQ.
   */
  var YIQ = function() {
  };
  
  YIQ.convertRGBtoYIQ = function(imageData) {
    // The alpha is ignored
    var buffer = new ArrayBuffer(imageData.data.length*3);
    var yiq    = new Float32Array(buffer);
    for (var j=0, k=0; j < imageData.data.length; j+=4, k+=3) {
      var r = imageData.data[j];
      var g = imageData.data[j+1];
      var b = imageData.data[j+2];
  
      yiq[k]   = 0.299*r + 0.587*g + 0.114*b;
      yiq[k+1] = 0.596*r - 0.274*g - 0.321*b;
      yiq[k+2] = 0.211*r - 0.523*g + 0.311*b;
    }
    return yiq;
  };
  YIQ.convertYIQtoRGB = function(yiq, imageData) {
    for (var j=0, k=0; k < yiq.length; j+=4, k+=3) {
      var y = yiq[k];
      var i = yiq[k+1];
      var q = yiq[k+2];
  
      imageData.data[j]   = Math.round(y + 0.956*i + 0.621*q); 
      imageData.data[j+1] = Math.round(y - 0.272*i - 0.647*q);
      imageData.data[j+2] = Math.round(y - 1.107*i + 1.705*q);
    }
    return imageData;
  };
  
  YIQ.shiftHue = function(yiq, rad) {
    for (var j = 0; j < yiq.length; j += 3) {
      var i = yiq[j+1];
      var q = yiq[j+2];
      yiq[j+1] = i * Math.cos(rad) - q * Math.sin(rad);
      yiq[j+2] = i * Math.sin(rad) + q * Math.cos(rad);
    }
  };
  YIQ.shiftSaturation = function(yiq, saturation) {
    for (var j = 0; j < yiq.length; j += 3) {
      yiq[j+1] = yiq[j+1] * saturation;
      yiq[j+2] = yiq[j+2] * saturation;
    }
  };
  YIQ.shiftValue = function(yiq, value) {
    for (var j = 0; j < yiq.length; j += 3) {
      yiq[j]   = yiq[j  ] * value;
      yiq[j+1] = yiq[j+1] * value;
      yiq[j+2] = yiq[j+2] * value;
    }
  };
  
  /**
   * Convolution applied to imageData.
   */
  var Convolution = function() {
  };
  
  Convolution.apply = function(kernel, imageData) {
    var clone = new Uint8Array(imageData.data);
  
    var rows = kernel.length;
    var cols = kernel[0].length;
  
    for (var x = 0; x < imageData.width; x++) {
      for (var y = 0; y < imageData.height; y++) {
        var i = (x + y * imageData.width) * 4;
  
        var r = 0;
        var g = 0;
        var b = 0;
        var weight = 0;
  
        for (var row = 0; row < rows; row++) {
          var yRow = y + row - Math.floor(rows/2);
          if (yRow >= 0 && (yRow < imageData.height)) {
  
            for (var col = 0; col < cols; col++) {
              var xCol = x + col - Math.floor(cols/2);
              if (xCol >= 0 && (xCol < imageData.width)) {
  
                var j = (xCol + yRow * imageData.width) * 4;
                weight += kernel[row][col];
                r += clone[j  ] * kernel[row][col];
                g += clone[j+1] * kernel[row][col];
                b += clone[j+2] * kernel[row][col];
              }
            }
  
          }
        }
  
        imageData.data[i]   = Math.round(r/weight);
        imageData.data[i+1] = Math.round(g/weight);
        imageData.data[i+2] = Math.round(b/weight);
      }
    }
    return imageData;
  };
  
  
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
  
  /**
   * Blurs, smoothen, or sharpens the image by applying a low-pass or 
   * high-pass filter.
   */
  var BlurFilter = function() {
    this.kernel = [[ 1, 1, 1 ], [ 1, 1, 1 ], [ 1, 1, 1 ]];
  };
  Node.call(BlurFilter.prototype);
  
  BlurFilter.prototype.useBasicBlur = function() {
    this.kernel = [[ 1, 1, 1 ], [ 1, 1, 1 ], [ 1, 1, 1 ]];
  };
  
  BlurFilter.prototype.useBasicSoften = function() {
    this.kernel = [[ 1, 1, 1 ], [ 1, 10, 1 ], [ 1, 1, 1 ]];
  };
  
  BlurFilter.prototype.useBasicSharpen = function() {
    this.kernel = [[ 0, -1, 0 ], [ -1, 6, -1 ], [ 0, -1, 0 ]];
  };
  
  BlurFilter.prototype.useBoxBlur = function(radius) {
    // Potential simulation of the bokeh effect
    this.kernel = [];
    var diameter = 2 * radius + 1;
    for (var i = 0; i < diameter; i++) {
      this.kernel[i] = [];
      for (var j = 0; j < diameter; j++) {
        var distance = Math.sqrt(Math.pow(i-radius, 2) + Math.pow(j-radius, 2));
        this.kernel[i][j] = (Math.round(distance) < radius) ? 1 : 0;
      }
    }
  };
  
  BlurFilter.prototype.useGaussianBlur = function(radius, sigma) {
    this.kernel = [];
    var diameter = 2 * radius + 1;
    for (var i = 0; i < diameter; i++) {
      this.kernel[i] = [];
      for (var j = 0; j < diameter; j++) {
        this.kernel[i][j] = 1/(2*Math.PI*sigma*sigma) * Math.exp(
          -(Math.pow(i-radius, 2) + Math.pow(j-radius, 2)) / 
          (2*sigma*sigma));
      }
    }
  };
  
  BlurFilter.prototype.render = function(imageData) {
    Convolution.apply(this.kernel, imageData);
    this._next(imageData);
  };
  
  Context.prototype.createBlurFilter = function() {
    return new BlurFilter();
  };
  
  /**
   * Shifts the saturation of the image.
   */
  var SaturationFilter = function() {
    this.value = 0; // Desaturate with value of -1
    this.compute = Light.average;
  };
  Node.call(SaturationFilter.prototype);
  
  SaturationFilter.prototype.render = function(imageData) {
    for (var i = 0; i < imageData.data.length; i += 4) {
      var r = imageData.data[i];
      var g = imageData.data[i+1];
      var b = imageData.data[i+2];
  
      var luminosity = this.compute(r, g, b);
  
      imageData.data[i]   = r + (r - luminosity) * this.value;
      imageData.data[i+1] = g + (g - luminosity) * this.value;
      imageData.data[i+2] = b + (b - luminosity) * this.value;
    }
  
    this._next(imageData);
  };
  
  Context.prototype.createSaturationFilter = function() {
    return new SaturationFilter();
  };
  
  /**
   * Controls the input and output ranges based on a curve.
   */
  var CurvesFilter = function() {
    this.precompute = null;
    this.curve = null;
    this.useLinearCurve(0, 127, 255);
  };
  Node.call(CurvesFilter.prototype);
  
  /**
   * Change the "levels" for this filter. A cubic spline curve with 3 points
   * is used for interpolation. The full output range (0-255) is used and it 
   * is assumed that shadows < midtones < highlights.
   */
  CurvesFilter.prototype.useLevels = function(shadow, midtone, highlight) {
    this.precompute = null;
    this.curve = function(value) {
      if (value <= shadow) {
        return 0;
      }
      if (value >= highlight) {
        return 255;
      }
  
    };
  };
  
  /**
   * Use a cubic spline curve for interpolation.
   */
  CurvesFilter.prototype.useCubicSplineCurve = function(points) {
    // Sort by input ranges ascending
    points.sort(function(a, b) {
      return a.input - b.input;
    });
  };
  
  CurvesFilter.prototype.render = function(imageData) {
    var meta = null;
    if (this.precompute) {
      meta = this.precompute(imageData);
    }
    for (var i = 0; i < imageData.data.length; i += 4) {
      var r = imageData.data[i];
      var g = imageData.data[i+1];
      var b = imageData.data[i+2];
  
      imageData.data[i]   = this.curve(r, meta);
      imageData.data[i+1] = this.curve(g, meta);
      imageData.data[i+2] = this.curve(b, meta);
    }
    this._next(imageData);
  };
  
  Context.prototype.createCurvesFilter = function() {
    return new CurvesFilter();
  };
  
  /**
   * Shifts the hue of the image.
   */
  var HueFilter = function() {
    this.shift = 0;
  };
  Node.call(HueFilter.prototype);
  
  HueFilter.prototype.render = function(imageData) {
    var yiq = YIQ.convertRGBtoYIQ(imageData);
    YIQ.shiftHue(yiq, this.shift);
    imageData = YIQ.convertYIQtoRGB(yiq, imageData);
    this._next(imageData);
  };
  
  Context.prototype.createHueFilter = function() {
    return new HueFilter();
  };
  
  /**
   * Shift the brightness of the image.
   */
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
  
  /**
   * Shift the contrast of the image.
   */
  var ContrastFilter = function() {
    this.multiplier = 1;
  };
  Node.call(ContrastFilter.prototype);
  
  ContrastFilter.prototype.render = function(imageData) {
    for (var i = 0; i < imageData.data.length; i += 4) {
      var r = imageData.data[i];
      var g = imageData.data[i+1];
      var b = imageData.data[i+2];
  
      imageData.data[i]   = (r - 128) * this.multiplier + 128;
      imageData.data[i+1] = (g - 128) * this.multiplier + 128;
      imageData.data[i+2] = (b - 128) * this.multiplier + 128;
    }
    this._next(imageData);
  };
  
  Context.prototype.createContrastFilter = function() {
    return new ContrastFilter();
  };
  
  /**
   * Applis a Sepia filter over the image to give it a brownish tint.
   */
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
