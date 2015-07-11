/* jshint strict: true, browser: true */
/* globals define, chrome */

define(['jquery', 'localstorage'], function($, localstorage) {
  'use strict';

  return {
    /**
     * Loads user credentials from local storage.
     * @returns {$.Promise}
     */
    get: function() {
      var deferred = $.Deferred();
      localstorage.getItem('credentials', function(v) {
        try {
          deferred.resolve(JSON.parse(v));
        } catch(e) {
          deferred.reject(e);
        }
      });
      return deferred;
    },
    /**
     * Updates stored user credentials and send message 'credentials:updated'.
     * @param credentials {{key: string, secret: string}} user credentials.
     */
    set: function(credentials) {
      var sendMessage = function() {
        if (chrome && chrome.runtime) {
          chrome.runtime.sendMessage(chrome.runtime.id, {
            event: 'credentials:updated'
          });
        }
      };
      credentials = JSON.stringify(credentials);
      var deferred = $.Deferred();
      localstorage.setItem('credentials', credentials, function() {
        deferred.resolve();
        sendMessage();
      });
      return deferred;
    }
  };
});
