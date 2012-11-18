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
