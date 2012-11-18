/**
 * Controls the input and output ranges based on a curve.
 */
var CurvesFilter = function() {
  this.precompute = null;
  this.curve = null;
  this.useLinearCurve(0, 127, 255);
};
Node.call(CurvesFilter.prototype);

/**
 * Change the "levels" for this filter. A cubic spline curve with 3 points
 * is used for interpolation. The full output range (0-255) is used and it 
 * is assumed that shadows < midtones < highlights.
 */
CurvesFilter.prototype.useLevels = function(shadow, midtone, highlight) {
  this.precompute = null;
  this.curve = function(value) {
    if (value <= shadow) {
      return 0;
    }
    if (value >= highlight) {
      return 255;
    }

  };
};

/**
 * Use a cubic spline curve for interpolation.
 */
CurvesFilter.prototype.useCubicSplineCurve = function(points) {
  // Sort by input ranges ascending
  points.sort(function(a, b) {
    return a.input - b.input;
  });
};

CurvesFilter.prototype.render = function(imageData) {
  var meta = null;
  if (this.precompute) {
    meta = this.precompute(imageData);
  }
  for (var i = 0; i < imageData.data.length; i += 4) {
    var r = imageData.data[i];
    var g = imageData.data[i+1];
    var b = imageData.data[i+2];

    imageData.data[i]   = this.curve(r, meta);
    imageData.data[i+1] = this.curve(g, meta);
    imageData.data[i+2] = this.curve(b, meta);
  }
  this._next(imageData);
};

Context.prototype.createCurvesFilter = function() {
  return new CurvesFilter();
};
