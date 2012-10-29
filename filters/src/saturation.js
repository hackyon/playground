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

    imageData.data[i]   = this.clamp(r + (r - luminosity) * this.value);
    imageData.data[i+1] = this.clamp(g + (g - luminosity) * this.value);
    imageData.data[i+2] = this.clamp(b + (b - luminosity) * this.value);
  }

  this._next(imageData);
};

Context.prototype.createSaturationFilter = function() {
  return new SaturationFilter();
};
