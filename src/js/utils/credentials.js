/* jshint strict: true, browser: true */
/* globals define, chrome */

define(['localstorage'], function(localstorage) {
  'use strict';

  return {
    /**
     * Loads user credentials.
     * If callback function is given credentials will be passed to callback
     * function else this function will return credentials.
     * @param cb {function} callback function to call after credentials loaded.
     * @returns {{key: string, secret: string}} if callback function is not
     *                                          given.
     */
    get: function(cb) {
      if (cb) {
        localstorage.getItem('credentials', cb);
      } else {
        var v = localstorage.getItem('credentials');
        try {
          return JSON.parse(v);
        } catch(e) {
          return v;
        }
      }
    },
    /**
     * Updates stored user credentials and send message 'credentials:updated'.
     * @param credentials {{key: string, secret: string}} user credentials.
     * @param cb {function} callback function to call after credentials
     *                      updated.
     */
    set: function(credentials, cb) {
      var sendMessage = function() {
        if (chrome && chrome.runtime) {
          chrome.runtime.sendMessage(chrome.runtime.id, {
            event: 'credentials:updated'
          });
        }
      };
      credentials = JSON.stringify(credentials);
      if (cb) {
        localstorage.setItem('credentials', credentials, function() {
          cb();
          sendMessage();
        });
      } else {
        localstorage.setItem('credentials', credentials, sendMessage);
      }
    }
  };
});
