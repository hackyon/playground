module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    meta: {
      version: '0.1.0',
      banner: '/**\n' +
              ' * HTML5 Canvas ImageFilters v0.1.0 - 2012-10-25\n' +
              ' * http://www.hackyon.com/playground/filters \n' +
              ' * \n' +
              ' * Copyright (c) 2012 Donald Lau (badassdon); Licensed MIT\n' +
              ' */'
    },
    concat: {
      dist: {
        src: ['<banner:meta.banner>', 'src/head.js', 
              '<indent:src/source.js>',
              '<indent:src/layer.js>',
              '<indent:src/mask.js>',
              '<indent:src/saturation.js>',
              '<indent:src/brightness.js>',
              '<indent:src/contrast.js>',
              '<indent:src/sepia.js>',
              'src/tail.js'],
        dest: 'filters.js'
      }
    },
    lint: {
      files: ['<config:concat.dist.dest>']
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: 'filters.min.js'
      }
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint test'
    },
    uglify: {}
  });
  
  // Register "indent" directive to indent filters
  grunt.task.registerHelper('indent', function(filepath, opts) {
    var body = grunt.task.directive(filepath, grunt.file.read);
    body = '  ' + body;
    body = body.replace(new RegExp("\n", 'g'), "\n  ");
    return body;
  });

  // Default task.
  grunt.registerTask('default', 'concat lint min');
};