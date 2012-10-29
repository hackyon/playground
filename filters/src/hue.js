var HueFilter = function() {
  this.shift = 0;
};
Node.call(HueFilter.prototype);
YIQConverter.call(HueFilter.prototype);

HueFilter.prototype.render = function(imageData) {
  var yiq = this.convertRGBtoYIQ(imageData);
  this.YIQshiftHue(yiq, this.shift);
  imageData = this.convertYIQtoRGB(yiq, imageData);
  this._next(imageData);
};

Context.prototype.createHueFilter = function() {
  return new HueFilter();
};
