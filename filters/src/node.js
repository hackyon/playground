/**
 * Filters and masks are applied by connecting nodes in a series.
 * Functions are attached as mixins.
 */
var Node = (function() {
  function connect(node, x, y) {
    if (!this._nextNodes) this._nextNodes = [];
    this._nextNodes.push(node);
    this._x = x || 0;
    this._y = y || 0;
  }
  function render(imageData) {
    if (!this._nextNodes) return;
    for (var i = 0; i < this._nextNodes.length; i++) {
      var node = this._nextNodes[i];
      node.render(imageData, this);
    }
  }

  return function() {
    this.connect  = connect;
    this.render   = render;
    this._next    = render;
    return this;
  };
})();
