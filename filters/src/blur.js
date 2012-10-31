/**
 * Blurs, smoothen, or sharpens the image by applying a low-pass or 
 * high-pass filter.
 */
var BlurFilter = function() {
  this.matrix = [[ 1, 1, 1 ], [ 1, 1, 1 ], [ 1, 1, 1 ]];
};
Node.call(BlurFilter.prototype);

BlurFilter.prototype._row = function(x, y, data, imageData, r) {
  var j = (x + (y-1+r) * imageData.width) * 4;
  var weight = 0;

  return weight;
};

BlurFilter.prototype.render = function(imageData) {
  var data = new Uint8Array(imageData.data);

  for (var x = 0; x < imageData.width; x += 1) {
    for (var y = 0; y < imageData.height; y += 1) {
      var weight = 0;
      var i = (x + y * imageData.width) * 4;
      var j = 0;

      var r = 0;
      var g = 0;
      var b = 0;

      if (y > 0) {
        j = (x + (y-1) * imageData.width) * 4;
        if (x > 0) {
          weight += this.matrix[0][0];
          r += data[j-4] * this.matrix[0][0];
          g += data[j-3] * this.matrix[0][0];
          b += data[j-2] * this.matrix[0][0];
        }
        weight += this.matrix[0][1];
        r += data[j]   * this.matrix[0][1];
        g += data[j+1] * this.matrix[0][1];
        b += data[j+2] * this.matrix[0][1];
        if (x < imageData.width-1) {
          weight += this.matrix[0][2];
          r += data[j+4] * this.matrix[0][2];
          g += data[j+5] * this.matrix[0][2];
          b += data[j+6] * this.matrix[0][2];
        }
      }

      j = (x + y * imageData.width) * 4;
      if (x > 0) {
        weight += this.matrix[1][0];
        r += data[j-4] * this.matrix[1][0];
        g += data[j-3] * this.matrix[1][0];
        b += data[j-2] * this.matrix[1][0];
      }
      weight += this.matrix[1][1];
      r += data[j]   * this.matrix[1][1];
      g += data[j+1] * this.matrix[1][1];
      b += data[j+2] * this.matrix[1][1];
      if (x < imageData.width-1) {
        weight += this.matrix[1][2];
        r += data[j+4] * this.matrix[1][2];
        g += data[j+5] * this.matrix[1][2];
        b += data[j+6] * this.matrix[1][2];
      }
     
      if (y < imageData.height-1) {
        j = (x + (y+1) * imageData.width) * 4;
        if (x > 0) {
          weight += this.matrix[2][0];
          r += data[j-4] * this.matrix[2][0];
          g += data[j-3] * this.matrix[2][0];
          b += data[j-2] * this.matrix[2][0];
        }
        weight += this.matrix[2][1];
        r += data[j]   * this.matrix[2][1];
        g += data[j+1] * this.matrix[2][1];
        b += data[j+2] * this.matrix[2][1];
        if (x < imageData.width-1) {
          weight += this.matrix[2][2];
          r += data[j+4] * this.matrix[2][2];
          g += data[j+5] * this.matrix[2][2];
          b += data[j+6] * this.matrix[2][2];
        }
      }

      r = Math.round(r / weight);
      g = Math.round(g / weight);
      b = Math.round(b / weight);

      imageData.data[i]   = r;
      imageData.data[i+1] = g;
      imageData.data[i+2] = b;
    }
  }

  this._next(imageData);
};

Context.prototype.createBlurFilter = function() {
  return new BlurFilter();
};
