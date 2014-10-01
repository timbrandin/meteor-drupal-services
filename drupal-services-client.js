DrupalServices = function() {
  'use strict';

  var requestToken;

  function initiateLogin(credentialToken, config, options, credentialRequestCompleteCallback) {
    var loginUrl =
          config.server + '/oauth/authorize' +
          '?oauth_consumer_key=' + config.consumerKey +
          '&oauth_token=' + credentialToken +
          '&oauth_callback=' + encodeURIComponent(Meteor.absoluteUrl('_oauth/drupal?close'));

    var loginStyle = OAuth._loginStyle('drupal', config, options);

    Oauth.launchlogin({
      loginService: "drupal",
      loginStyle: loginStyle,
      loginUrl: loginUrl,
      credentialRequestCompleteCallback: credentialRequestCompleteCallback,
      credentialToken: credentialToken
    });
  };

  return {
    /**
     * Request Drupal credentials for the user
     * @param options {optional}
     * @param credentialRequestCompleteCallback {Function} Callback function to
     *   call on completion. Takes one argument, credentialToken on success, or
     *   Error on error.
     */
    requestCredential: function (options, credentialRequestCompleteCallback) {
      // support both (options, callback) and (callback).
      if (!credentialRequestCompleteCallback && typeof options === 'function') {
        credentialRequestCompleteCallback = options;
        options = {};
      }

      var config = ServiceConfiguration.configurations.findOne({service: 'drupal'});
      if (!config) {
        credentialRequestCompleteCallback && credentialRequestCompleteCallback(new ServiceConfiguration.ConfigError("Service not configured"));
        return;
      }

      // Wait for a request token from the server to pass with the client for the authorization.
      // var credentialToken = getRequestToken();
      if (!requestToken || requestToken.expire < +new Date) {
        Meteor.call('drupalServicesRequestToken', function(error, response) {
          if (!error) {
            requestToken = response;
            initiateLogin(requestToken.oauth_token, config, options, credentialRequestCompleteCallback);
          }
          else {
            throw new Error("Failed to get request token. " + error.message);
          }
        });
      } else {
        initiateLogin(requestToken.oauth_token, config, options, credentialRequestCompleteCallback);
      }
    }
  }
}();
