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
