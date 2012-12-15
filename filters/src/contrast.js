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

    imageData.data[i]   = clamp((r - 128) * this.multiplier + 128);
    imageData.data[i+1] = clamp((g - 128) * this.multiplier + 128);
    imageData.data[i+2] = clamp((b - 128) * this.multiplier + 128);
  }
  this._next(imageData);
};

Context.prototype.createContrastFilter = function() {
  return new ContrastFilter();
};
