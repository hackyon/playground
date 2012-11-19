/**
 * Controls the input and output ranges based on a curve.
 */
var CurvesFilter = function() {
  this.precompute = null;
  this.curve = null;
};
Node.call(CurvesFilter.prototype);

/**
 * Change the "levels" for this filter. A cubic spline curve with 3 points
 * is used for interpolation. The full output range (0-255) is used and it 
 * is assumed that shadows < midtones < highlights.
 */
CurvesFilter.prototype.useLevels = function(shadow, midtone, highlight) {
  this.useCubicSplineCurve([
    { input: shadow   , output: 0   },
    { input: midtone  , output: 127 },
    { input: highlight, output: 255 }
  ]);
};

/**
 * Use a cubic spline curve for interpolation.
 */
CurvesFilter.prototype.useCubicSplineCurve = function(points) {
  // Sort by input ranges ascending
  points.sort(function(a, b) {
    return (a.input - b.input);
  });

  if (points.length == 2) {
    var slope = (points[1].output - points[0].output) /  
                (points[1].input - points[0].input);

    this.curve = function(value) {
      if (value < points[0].input) {
        return 0;
      } else if (value > points[1].input) {
        return 255;
      } else {
        return (value - points[0].input) * slope + points[0].output;
      }
    };
  } else { 
    // Compute k1..kn for natural cubic splines
    var coefficients = [];
    var vector = [];

    var i = 0, j = 0;
    var size = points.length;

    for (i = 0; i < size; i++) {
      coefficients[i] = [];
      for (j = 0; j < size; j++) {
        coefficients[i][j] = 0;
      }
      vector[i] = [];
      vector[i][0] = 0;
    }

    coefficients[0][0] = 2 / (points[1].input - points[0].input);
    coefficients[0][1] = 1 / (points[1].input - points[0].input);
    vector[0][0] = 3 * (points[1].output - points[0].output) / Math.pow(points[1].input - points[0].input, 2);

    i = size-1;
    coefficients[i][i]   = 2 / (points[i].input - points[i-1].input);
    coefficients[i][i-1] = 1 / (points[i].input - points[i-1].input);
    vector[i][0] = 3 * (points[i].output - points[i-1].output) / Math.pow(points[i].input - points[i-1].input, 2);

    for (i = 1; i < size-1; i++) {
      coefficients[i][i-1] = 1 / (points[i].input - points[i-1].input);
      coefficients[i][i  ] = 2 * ( 1 / (points[i].input - points[i-1].input) + 1 / (points[i+1].input - points[i].input) );
      coefficients[i][i+1] = 1 / (points[i+1].input - points[i].input);
      vector[i][0] = 3 * ( (points[i].output - points[i-1].output) / Math.pow(points[i].input - points[i-1].input, 2) + (points[i+1].output - points[i].output) / Math.pow(points[i+1].input - points[i].input, 2) );
    }

    var k = Matrix.solveLinearEquations(coefficients, vector); 

    // Generate the piecewise function
    var pieces = [];
    if (points[0].input > 0) {
      pieces.push({
        start: 0,
        end: points[0].input,
        f: function(value) { return 0; }
      });
    }

    var makePiece = function(a, b, i) {
      return function(value) {
        var t = (value - points[i].input) / (points[i+1].input - points[i].input);
        return (1-t) * points[i].output + t * points[i+1].output + t * (1-t) * (a * (1-t) + b * t);
      };
    };
    for (i = 0; i < size-1; i++) {
      var a = k[i] * (points[i+1].input - points[i].input) - (points[i+1].output - points[i].output);
      var b = -k[i+1] * (points[i+1].input - points[i].input) + (points[i+1].output - points[i].output);

      pieces.push({
        start: points[i].input,
        end:   points[i+1].input,
        f:     makePiece(a, b, i)
      });
    }

    if (points[size-1].input < 255) {
      pieces.push({
        start: points[size-1].input,
        end: 255,
        f: function(value) { return 255; }
      });
    }

    var cache = [];
    this.curve = function(value) {
      if (cache[value] !== undefined) {
        return cache[value];
      }

      // Binary search for the piecewise function
      var low  = 0;
      var high = pieces.length-1;
      var piece = null;

      while (low < high) {
        var mid = Math.floor((high + low) / 2);
        if (pieces[mid].start > value) {
          high = mid-1;
        } else if (pieces[mid].end < value) {
          low  = mid+1;
        } else {
          piece = pieces[mid].f;
          break;
        }
      }
      if (!piece) {
        piece = pieces[low].f;
      }

      cache[value] = piece(value);
      return cache[value];
    };
  }
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

