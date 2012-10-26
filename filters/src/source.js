/**
 * Data source for an image.
 */
var Source = function() { 
};
Node.call(Source.prototype);

Source.prototype.render = function() {
  var self = this;
  
  var image = new Image();
  image.onload = function() {
    var canvas = document.createElement('canvas');
    canvas.setAttribute('width',  image.width);
    canvas.setAttribute('height', image.height);

    var context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    var imageData = context.getImageData(0, 0, image.width, image.height);

    self._next(imageData);
  };
  image.src = self.url;
};

Context.prototype.createSource = function() {
  return new Source();
};
