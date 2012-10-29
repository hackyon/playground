/**
 * Conversion between RGB and CYMK. Functions are available as mixins.
 */
var CMYKConverter = (function() {
  function convertToCMYK(imageData) {
    // The alpha is ignored
    var buffer = new ArrayBuffer(imageData.data.length * 4);
    var cmyk   = new Float32Array(buffer);
    for (var i = 0; i < imageData.data.length; i += 4) {
      var r = imageData.data[i];
      var g = imageData.data[i+1];
      var b = imageData.data[i+2];

      var c = 1 - (r/255);
      var m = 1 - (g/255);
      var y = 1 - (b/255);

      var k = Math.min(c, m, y);
      cmyk[i  ] = (c-k)/(1-k)*100;
      cmyk[i+1] = (m-k)/(1-k)*100;
      cmyk[i+2] = (y-k)/(1-k)*100;
      cmyk[i+3] = k*100; 
    }
    return cmyk;
  }
  function convertToRGB(cmyk, imageData) {
    for (var i = 0; i < cmyk.length; i += 4) {
      var c = cmyk[i]  /100;
      var m = cmyk[i+1]/100;
      var y = cmyk[i+2]/100;
      var k = cmyk[i+3]/100;

      imageData.data[i]   = Math.round(255*(1-((c*(1-k))+k)));
      imageData.data[i+1] = Math.round(255*(1-((m*(1-k))+k)));
      imageData.data[i+2] = Math.round(255*(1-((y*(1-k))+k)));
    }
    return imageData;
  }

  return function() {
    this.convertToCMYK = convertToCMYK;
    this.convertToRGB  = convertToRGB;
  };
})();
