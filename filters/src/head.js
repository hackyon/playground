(function(scope) {
  /**
   * Filters are namespaced inside a ImageFilterContext.
   */
  var Context = function() {
  };

  var clamp = function(value) {
    return Math.min(255, Math.max(0, value));
  };
