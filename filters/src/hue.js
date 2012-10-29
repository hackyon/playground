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
