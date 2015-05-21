'use strict';
/* jshint strict: true, node: true */

var path = require('path');

function here() {
  var args = Array.prototype.slice.call(arguments, 0);
  args.unshift(__dirname);
  return path.join.apply(path.join, args);
}

module.exports = function(grunt) {
  grunt.task.loadNpmTasks('grunt-bower-task');
  grunt.task.loadNpmTasks('grunt-contrib-jshint');
  grunt.task.loadNpmTasks('grunt-contrib-requirejs');
  grunt.task.loadNpmTasks('grunt-contrib-uglify');
  grunt.task.loadNpmTasks('grunt-mocha-phantomjs');

  var pkg = grunt.file.readJSON(here('package.json'));

  var paths = {
    jquery: '../../vendor/jquery',
    Backbone: '../../vendor/backbone',
    underscore: '../../vendor/underscore',
    localstorage: '../../vendor/localstorage'
  };

  grunt.initConfig({
    pkg: pkg,
    jshint: {
      files: [
        'src/**/*.js',
        'test/**/*.js',
        'Gruntfile.js'
      ],
      options: {
        strict: true,
        indent: 2,
        maxlen: 80
      }
    },
    bower: {
      install: {
        options: {
          targetDir: '',
          verbose: true,
          layout: function() {
            return 'vendor';
          }
        }
      }
    },
    requirejs: {
      dist: {
        options: {
          baseUrl: 'src/js',
          optimize: 'none',
          name: 'utils',
          out: 'dist/utils.js',
          exclude: ['underscore', 'jquery', 'Backbone', 'localstorage'],
          paths: paths
        }
      },
      'dist.full': {
        options: {
          baseUrl: 'src/js',
          optimize: 'none',
          name: 'utils',
          out: 'dist/utils.full.js',
          paths: paths
        }
      }
    },
    uglify: {
      options: {
        beautify: false
      },
      dist: {
        src: here('dist', 'utils.js'),
        dest: here('dist', 'utils.min.js')
      },
      'dist.full': {
        src: here('dist', 'utils.full.js'),
        dest: here('dist', 'utils.full.min.js')
      }
    },
    mocha_phantomjs: {
      all: [
        'test/runner.html'
      ]
    }
  });

  grunt.registerTask('default', [
    'bower',
    'jshint',
    'mocha_phantomjs',
    'requirejs',
    'uglify'
  ]);
};
