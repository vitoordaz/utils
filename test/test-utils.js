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

    describe('Test getProperty', function() {
      it('should return value of "not nested" properties', function() {
        should(utils.getProperty({blah: 1}, 'blah')).be.eql(1);
      });

      it('should return value of "nested" properties', function() {
        should(utils.getProperty({
          foo: {
            bar: 1
          }
        }, 'foo.bar')).be.eql(1);
      });

      it('should return works with arrays', function() {
        should(utils.getProperty({foo: []}, 'foo.length')).be.eql(0);
        should(utils.getProperty({foo: [1, 2, 3]}, 'foo.length')).be.eql(3);
      });

      it('should return undefined if property does not exist', function() {
        should(utils.getProperty({
          foo: 'string'
        }, 'foo.__does_not_exist__')).be.undefined;

        should(utils.getProperty({
          foo: 'string'
        }, 'foo.bar.something')).be.undefined;
      });

      it('should return property of Backbone.Model', function() {
        var m = new Backbone.Model({
          foo: {
            bar: 1
          }
        });
        should(utils.getProperty(m, 'foo')).be.eql({bar: 1});
        should(utils.getProperty(m, 'foo.bar')).be.eql(1);

        m = new Backbone.Model({
          foo: new Backbone.Model({
            bar: 1
          })
        });
        should(utils.getProperty(m, 'foo.bar')).be.eql(1);

        m = new Backbone.Model({
          foo: new Backbone.Collection([{
            id: 1
          }, {
            id: 2
          }, {
            id: 3
          }])
        });
        should(utils.getProperty(m, 'foo.length')).be.eql(3);
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
