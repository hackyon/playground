/**
 * Histogram of the image data.
 */
var Histogram = function() {
};

Histogram.compute = function(imageData) {
  var histogram = new Float32Array(256);
  var max = 0;
 
  for (var i = 0; i < imageData.data.length; i += 4) {
    var r = imageData.data[i];
    var g = imageData.data[i+1];
    var b = imageData.data[i+2];

    var luminosity = Math.round(Light.lightness(r, g, b));
    histogram[luminosity] += 1;
    max = Math.max(max, histogram[luminosity]);
  }

  // Normalize based on the max
  for (var j = 0; j < histogram.length; j += 1) {
    histogram[j] = histogram[j] / max;
  }
  return histogram;
};

Histogram.draw = function(histogram, canvas) {
  // Debugging
  var context = canvas.getContext('2d');
  var width   = canvas.width/256;
  var height  = canvas.height;

  for (var i = 0; i < histogram.length; i += 1) {
    context.fillRect(i * width, height, width, -height*(1-histogram[i]));
  }
};
