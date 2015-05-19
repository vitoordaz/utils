/* jshint strict: true, expr: true */
/* globals define, describe, it */

define(['should', 'Backbone', 'utils'], function(should, Backbone, utils) {
  'use strict';

  describe('Test utils', function() {
    describe('Test submodules', function() {
      it('should has credentials', function() {
        should(utils).have.property('credentials');
      });
    });

    describe('Test utils.noop', function() {
      it('should do nothing', function() {
        utils.noop(1);
      });
    });

    describe('Test getStringVariables', function() {
      it('should return an empty array for empty values', function() {
        should(utils.getStringVariables()).be.eql([]);
        should(utils.getStringVariables('')).be.eql([]);
      });

      it('should return only nested variable', function() {
        should(utils.getStringVariables('{{ a {{ b }} }}')).be.eql(['b']);
      });

      it('should ignore variables with spaces', function() {
        should(utils.getStringVariables('{{ a b }}')).be.eql([]);
      });

      it('should ignore spaces between {{ and variable name', function() {
        should(utils.getStringVariables('{{a}}')).be.eql(['a']);
        should(utils.getStringVariables('{{a       }}')).be.eql(['a']);
        should(utils.getStringVariables('{{     a}}')).be.eql(['a']);
        should(utils.getStringVariables('{{      a       }}')).be.eql(['a']);
        should(utils.getStringVariables('{{ word }}')).be.eql(['word']);
      });
    });

    describe('Test interpolateValueString', function() {
      it('should not do anything with empty values', function() {
        var model = new Backbone.Model();
        should(utils.interpolateValueString(model)).be.undefined;
        should(utils.interpolateValueString(model, '')).be.eql('');
        should(utils.interpolateValueString(model, [])).be.eql([]);
      });

      it('should replace unknown value with empty string', function() {
        var model = new Backbone.Model();
        should(utils.interpolateValueString(model, '{{ a }} ')).be.eql(' ');
        model.set('a', 'A');
        should(utils.interpolateValueString(
          model, '{{ a }} - {{ b }}')).be.eql('A - ');
      });

      it('should ignore spaces in variable definition', function() {
        var model = new Backbone.Model();
        model.set('property', 'something');
        should(utils.interpolateValueString(model, '{{property}}'))
          .be.eql('something');
        should(utils.interpolateValueString(model, '{{ property}}'))
          .be.eql('something');
        should(utils.interpolateValueString(model, '{{property}}'))
          .be.eql('something');
        should(utils.interpolateValueString(model, '{{ property }}'))
          .be.eql('something');
      });

      it(
        'should cast type if a given value has only one variable and ' +
        'variable is null, undefined or boolean',
        function() {
          var model = new Backbone.Model();

          model.set('a', true);
          should(utils.interpolateValueString(model, '{{ a }}')).be.true;

          model.set('b', false);
          should(utils.interpolateValueString(model, '{{ b }}')).be.false;

          model.set('c', null);
          should(utils.interpolateValueString(model, '{{ c }}')).be.null;

          model.set('d', undefined);
          should(utils.interpolateValueString(model, '{{ d }}')).be.undefined;
        }
      );
    });
  });
});
