/**
 * Various ways of computing luminance.
 */
var Light = function() {
};

Light.average = function(r, g, b) {
  return (r+g+b)/3;
};
Light.lightness = function(r, g, b) {
  return 0.5 * (Math.max(r,g,b) + Math.min(r,g,b));
};
Light.luminosity = function(r, g, b) {
  return (r*0.2125 + g*0.7154 + b*0.0721); 
};

