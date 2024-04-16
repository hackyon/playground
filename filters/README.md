[JS Image Filters](https://hackyon.github.io/playground/filters/) on HTML5 Canvas
==================

JavaScript implementations of image filters (Hue, Saturation, Contrast, etc.) by manipulating pixel data on a HTML5 canvas. The filters are applied by rendering images onto a "source" canvas and forwarding the image data through a filter pipeline. There are some plans to port this project as a polyfill for CSS3 filters.

The project is built and packaged using [Grunt](https://gruntjs.com/).

### List of Filters

* Blur (Box and Gaussian) & Soften 
* Hue
* Saturation
* Contrast
* Brightness
* Pixelate
* Sepia
* Masking
* Levels & Curves (with cubic splines)

### Reusable Helper Libraries

* Basic Matrix Computations - add, multiply, Guassian-Jordan Elimination, inverse, solving linear equations
* Convolution Matrix
* Conversion from RGB to YIQ and CMYK
* Image Histogram


A small jQuery plugin called HoverScroll (```lib/jquery.hoverscroll.js```) is also included. This plugin scrolls a list of images horizontally as you move the mouse left and right over the images.
