/**
 * Pixelates the image.
 */
var PixelateFilter = function() {
  this.size = 10;
};
Node.call(PixelateFilter.prototype);

PixelateFilter.prototype.render = function(imageData) {
  var rows = Math.ceil(imageData.width  / this.size);
  var cols = Math.ceil(imageData.height / this.size);

  for (var row = 0; row < rows; row++) {
    for (var col = 0; col < cols; col++) {
      var x = row * this.size;
      var y = col * this.size;
      var i = (x + y * imageData.width) * 4;

      var r = imageData.data[i];
      var g = imageData.data[i+1];
      var b = imageData.data[i+2];
      var a = imageData.data[i+3];
    
      for (var x1 = 0; x1 < this.size; x1++) {
        for (var y1 = 0; y1 < this.size; y1++) {
          var j = (x + x1 + (y + y1) * imageData.width) * 4;
          imageData.data[j  ] = r;
          imageData.data[j+1] = g;
          imageData.data[j+2] = b;
          imageData.data[j+3] = a;
        }
      }
    }
  }

  this._next(imageData);
};

Context.prototype.createPixelateFilter = function() {
  return new PixelateFilter();
};
