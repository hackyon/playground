/**
 * Conversion between RGB and YIQ.
 */
var YIQConverter = (function() {
  function convertRGBtoYIQ(imageData) {
    // The alpha is ignored
    var buffer = new ArrayBuffer(imageData.data.length*3);
    var yiq    = new Float32Array(buffer);
    for (var j=0, k=0; j < imageData.data.length; j+=4, k+=3) {
      var r = imageData.data[j];
      var g = imageData.data[j+1];
      var b = imageData.data[j+2];

      yiq[k]   = 0.299*r + 0.587*g + 0.114*b;
      yiq[k+1] = 0.596*r - 0.274*g - 0.321*b;
      yiq[k+2] = 0.211*r - 0.523*g + 0.311*b;
    }
    return yiq;
  }
  function convertYIQtoRGB(yiq, imageData) {
    for (var j=0, k=0; k < yiq.length; j+=4, k+=3) {
      var y = yiq[k];
      var i = yiq[k+1];
      var q = yiq[k+2];

      imageData.data[j]   = Math.round(y + 0.956*i + 0.621*q); 
      imageData.data[j+1] = Math.round(y - 0.272*i - 0.647*q);
      imageData.data[j+2] = Math.round(y - 1.107*i + 1.705*q);
    }
    return imageData;
  }
  function shiftHue(yiq, rad) {
    for (var j = 0; j < yiq.length; j += 3) {
      var i = yiq[j+1];
      var q = yiq[j+2];
      yiq[j+1] = i * Math.cos(rad) - q * Math.sin(rad);
      yiq[j+2] = i * Math.sin(rad) + q * Math.cos(rad);
    }
  }
  function shiftSaturation(yiq, saturation) {
    for (var j = 0; j < yiq.length; j += 3) {
      yiq[j+1] = yiq[j+1] * saturation;
      yiq[j+2] = yiq[j+2] * saturation;
    }
  }
  function shiftValue(yiq, value) {
    for (var j = 0; j < yiq.length; j += 3) {
      yiq[j]   = yiq[j  ] * value;
      yiq[j+1] = yiq[j+1] * value;
      yiq[j+2] = yiq[j+2] * value;
    }
  }

  return function() {
    this.convertRGBtoYIQ = convertRGBtoYIQ;
    this.convertYIQtoRGB = convertYIQtoRGB;
    this.YIQshiftHue = shiftHue;
    this.YIQshiftSaturation = shiftSaturation;
    this.YIQshiftValue = shiftValue;
  };
})();
