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
