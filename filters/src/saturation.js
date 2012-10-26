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
