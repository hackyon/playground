/**
 * Layer to compose and position multiple sources.
 */
var Layer = function() {
  this.width  = 0;
  this.height = 0;
  this.canvas = null;
};
Node.call(Layer.prototype);

Layer.prototype.render = function(imageData, source) {
  var canvas = this.canvas;
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.setAttribute('width',  this.width);
    canvas.setAttribute('height', this.height);
    this.canvas = canvas;
  } else {
    this.width  = canvas.width;
    this.height = canvas.height;
  }

  var x = source._x || 0;
  var y = source._y || 0;

  var context = canvas.getContext('2d');
  context.putImageData(imageData, x, y);

  var data = context.getImageData(0, 0, this.width, this.height);
  this._next(data);
};

Context.prototype.createLayer = function() {
  return new Layer();
};
