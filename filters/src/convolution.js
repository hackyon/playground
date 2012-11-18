/**
 * Convolution applied to imageData.
 */
var Convolution = function() {
};

Convolution.apply = function(kernel, imageData) {
  var clone = new Uint8Array(imageData.data);

  var rows = kernel.length;
  var cols = kernel[0].length;

  for (var x = 0; x < imageData.width; x++) {
    for (var y = 0; y < imageData.height; y++) {
      var i = (x + y * imageData.width) * 4;

      var r = 0;
      var g = 0;
      var b = 0;
      var weight = 0;

      for (var row = 0; row < rows; row++) {
        var yRow = y + row - Math.floor(rows/2);
        if (yRow > 0 && (yRow < imageData.height-1)) {

          for (var col = 0; col < cols; col++) {
            var xCol = x + col - Math.floor(cols/2);
            if (xCol > 0 && (xCol < imageData.width-1)) {

              var j = (xCol + yRow * imageData.width) * 4;
              weight += kernel[row][col];
              r += clone[j  ] * kernel[row][col];
              g += clone[j+1] * kernel[row][col];
              b += clone[j+2] * kernel[row][col];
            }
          }

        }
      }

      imageData.data[i]   = Math.round(r/weight);
      imageData.data[i+1] = Math.round(g/weight);
      imageData.data[i+2] = Math.round(b/weight);
    }
  }
  return imageData;
};

