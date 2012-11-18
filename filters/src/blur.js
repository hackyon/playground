/**
 * Blurs, smoothen, or sharpens the image by applying a low-pass or 
 * high-pass filter.
 */
var BlurFilter = function() {
  this.kernel = [[ 1, 1, 1 ], [ 1, 1, 1 ], [ 1, 1, 1 ]];
};
Node.call(BlurFilter.prototype);

BlurFilter.prototype.render = function(imageData) {
  Convolution.apply(this.kernel, imageData);
  this._next(imageData);
};

Context.prototype.createBlurFilter = function() {
  return new BlurFilter();
};
