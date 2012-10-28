(function(scope) {
  /**
   * Filters are namespaced inside a ImageFilterContext.
   */
  var Context = function() {
  };

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
    function clamp(color) {
      return Math.max(Math.min(color, 255), 0);
    }

    return function() {
      this.connect  = connect;
      this.render   = render;
      this._next    = render;
      this.clamp    = clamp;
      return this;
    };
  })();
