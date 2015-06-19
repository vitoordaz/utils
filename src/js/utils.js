/* jshint strict: true, browser: true */
/* globals define, chrome, console */

define([
  'underscore',
  'jquery',
  'Backbone',
  'exports',
  'utils/credentials'
], function(_, $, Backbone, exports, credentials) {
  'use strict';

  exports.credentials = credentials;

  exports.noop = function() {
  };

  /**
   * Returns full name string.
   * @param first {string} first name
   * @param last {string} last name
   * @param middle {string} middle name
   * @returns {string} full name
   */
  exports.getFullName = function(first, last, middle) {
    var parts = [];
    [first, last, middle].forEach(function(p) {
      if (!!p) {
        parts.push(p);
      }
    });
    return parts.join(' ');
  };

  /**
   * Returns a string representation of time interval, for example 01:20:55.
   * @param duration {moment.duration} duration object
   * @returns {string} time interval
   */
  exports.durationToString = function(duration) {
    var hours = duration.get('hours');
    var minutes = duration.get('minutes');
    var seconds = duration.get('seconds');
    return [
      hours > 9 ? hours : '0' + hours,
      minutes > 9 ? minutes : '0' + minutes,
      seconds > 9 ? seconds : '0' + seconds
    ].join(':');
  };

  /**
   * Returns a normalized phone number.
   * @param phoneNumber {string} phone number
   * @param defaultStateCode {string} default state code
   * @returns {*} normalized phone number
   */
  exports.normalizePhoneNumber = function(phoneNumber, defaultStateCode) {
    var LETTERS_PREFIX_REGEX = /^[a-z]+\-([\d]+)$/;
    var original = phoneNumber;

    // lets default country be Russia (+7)
    defaultStateCode = defaultStateCode || '7';

    if (phoneNumber[0] === '+') {
      phoneNumber = phoneNumber.substring(1);
    }

    phoneNumber = phoneNumber.replace(/[\s\(\)]+/g, '');

    // Check for phone number like this fxo-74957532001
    if (LETTERS_PREFIX_REGEX.test(phoneNumber)) {
      phoneNumber = phoneNumber.replace(LETTERS_PREFIX_REGEX, '$1');
    }

    var countryCode;
    var code;
    var number;
    if (/^[0-9]+$/.test(phoneNumber)) {
      if (phoneNumber.length >= 11) {
        // >= 11 because some country codes length are more then 1
        countryCode = phoneNumber.substring(0, phoneNumber.length - 10);
        if (countryCode === '8') {
          countryCode = defaultStateCode;
        }
        code = phoneNumber.substring(
          phoneNumber.length - 10, phoneNumber.length - 7);
        number = phoneNumber.substring(phoneNumber.length - 7);
        return countryCode + code + number;
      } else if (phoneNumber.length === 10) {
        return defaultStateCode + phoneNumber;
      }
      return phoneNumber;
    }

    return original;
  };

  exports.prettyPhone = function(v) {
    v = exports.normalizePhoneNumber(v);
    if (_.isString(v)) {
      // remove all spaces first
      v = v.replace(/\s+/g, '');
      if (/^\+?\d+$/.test(v)) {
        // trim + in the beginning of phone number
        if (v.charAt(0) === '+') {
          v = v.substring(1);
        }
        if (10 <= v.length && v.length <= 11) {
          if (v.length === 10) {
            // we assume that country code is 7 (Russia)
            v += '7' + v;
          }
          if (v.length === 11) {
            // if state code is 8 replace it to 7 (Russia)
            if (v[0] === '8') {
              v = '7' + v.substring(1);
            }
          }
          v = '+' + v[0] + ' (' + v.substring(1, 4) + ') ' +
          v.substring(4, 7) + ' ' +
          v.substring(7, 9) + ' ' +
          v.substring(9);
        }
      }
    }
    return v;
  };

  /**
   * Returns generated UUID v4.
   * @returns {string}
   */
  exports.generateUUID = function() {
    var d = new Date().getTime();
    var str = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    return str.replace(/[xy]/g, function(c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
  };

  var VARIABLE_BLOCK_REGEX = /{{\s*\S+\s*}}/g;
  var VARIABLE_REGEX = /^{{\s*(\S*)\s*}}$/;

  /**
   * Recursively sets property value.
   * @param obj {Backbone.Model|{}} object to set property.
   * @param property {string} property name.
   * @param value {*} property value.
   */
  exports.setProperty = function(obj, property, value) {
    var parts = property.split('.');
    _.each(parts.slice(0, parts.length - 1), function(part) {
      if (obj instanceof Backbone.Model) {
        if (_.isUndefined(obj.get(part))) {
          obj.set(part, {});
        }
        obj = obj.get(part);
      } else {
        if (_.isUndefined(obj[part])) {
          obj[part] = {};
        }
        obj = obj[part];
      }
    });
    if (obj instanceof Backbone.Model) {
      obj.set(_.last(parts), value);
    } else {
      obj[_.last(parts)] = value;
    }
  };

  /**
   * Recursively gets property of a given object.
   * @param obj {Backbone.Model|{}} object to get property.
   * @param property {string} property name.
   * @returns {*} property value.
   */
  exports.getProperty = function(obj, property) {
    if (_.isUndefined(property)) {
      return;
    }
    var parts = property.split('.');
    var value = obj;
    var part;
    var index;
    for (var i = 0;
         i < parts.length && !_.isUndefined(value) && !_.isNull(value);
         ++i) {
      part = parts[i];
      if (value instanceof Backbone.Model) {
        // If object has a get method then we should try to use it first to
        // get property value.
        if (_.isUndefined(value.get(part)) && part in value) {
          value = value[part];
        } else {
          value = value.get(part);
        }
      } else if (value instanceof Backbone.Collection) {
        // It seems that value is a Backbone.Collection we should use at to
        // get item by index.
        index = parseInt(part);
        if (!_.isNaN(index)) {
          value = value.at(index);
        } else {
          if (_.isUndefined(value.get(part)) && part in value) {
            value = value[part];
          } else {
            value = value.get(part);
          }
        }
      } else {
        value = value[part];
      }
    }
    return value;
  };

  /**
   * Returns a list of string variables.
   * @param str {string} string with variables
   * @returns {[]}
   */
  exports.getStringVariables = function(str) {
    var vars = [];
    if (!!str && _.isString(str)) {
      _.each(str.match(VARIABLE_BLOCK_REGEX), function(varBlock) {
        var variable = varBlock.match(VARIABLE_REGEX)[1];
        if (!!variable) {
          vars.push(variable);
        }
      });
    }
    return _.uniq(vars.sort(), true);
  };

  /**
   * Interpolate variables in string using given context.
   * @param context {Backbone.Model} model object.
   * @param value {string} string with variables to interpolate.
   * @returns {string} string with interpolated variables.
   */
  exports.interpolateValueString = function(context, value) {
    if (_.isString(value)) {
      var variables = exports.getStringVariables(value);
      if (variables.length === 0) {
        return value;
      }
      var processVariable = function(variable) {
        var regex = new RegExp('{{\\s*' + variable + '\\s*}}', 'g');
        var variableValue = exports.getProperty(context, variable);
        if (!_.isNull(variableValue) && !_.isUndefined(variableValue)) {
          variableValue = variableValue.toString();
        }
        value = value.replace(regex, variableValue || '');
      };

      if (variables.length !== 1) {
        _.each(variables, processVariable);
      } else {
        var variable = _.first(variables);
        var variableValue = exports.getProperty(context, variable);
        var regex = new RegExp('{{\\s*' + variable + '\\s*}}', 'g');
        value = value.replace(regex, '{{' + variable + '}}');
        if (value !== '{{' + variable + '}}') {
          value = value.replace(regex, variableValue || '');
        } else {
          // NOTE: It's seems that a given value has only variable definition,
          // so we should return current variable value.
          return variableValue;
        }
      }
    }
    return value;
  };

  /**
   * Resize chrome app window size based on current document body size.
   */
  exports.updateChromeWindowSize = function() {
    if (chrome && chrome.app && chrome.app.window) {
      var win = chrome.app.window.current();
      var wWidth = win.outerBounds.width;
      var wHeight = win.outerBounds.height;
      var body = $('body');
      var width = body.width();
      var height = body.height();
      if (wWidth !== width || wHeight !== height) {
        try {
          window.resizeTo(width, height);
        } catch (err) {
          console.error('Unhandled exception in resizeCallWindow', err);
        }
      }
    }
  };
});
