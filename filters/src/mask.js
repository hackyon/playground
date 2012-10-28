/**
 * Creates a mask using a canvas.
 */
var CanvasMask = function() {
  this.offsetX = 0;
  this.offsetY = 0;
  this.canvas = null;
};
Node.call(CanvasMask.prototype);

CanvasMask.prototype.render = function(imageData) {
  if (!this.canvas) {
    this._next(imageData);
    return;
  }

  var canvas  = this.canvas;
  var context = canvas.getContext('2d');
  var mask = context.getImageData(0, 0, canvas.width, canvas.height);

  for (var x = 0; x < mask.width; x++) {
    for (var y = 0; y < mask.height; y++) {
      var i = (x + y * mask.width) * 4;

      var targetX = this.offsetX + x;
      var targetY = this.offsetY + y;
      if (targetX >= imageData.width || targetY >= imageData.height) continue;

      // The mask is based on the alpha value 
      var j = (targetX + targetY * imageData.width) * 4;
      if (imageData.data[j+3] !== 0) {
        imageData.data[j+3] = mask.data[i+3];
      }
    }
  }
  this._next(imageData);
};

Context.prototype.createCanvasMask = function() {
  return new CanvasMask();
};
