DrupalService = {};

// Request Drupal credentials for the user
// @param options {optional}
// @param credentialRequestCompleteCallback {Function} Callback function to
//   call on completion. Takes one argument, credentialToken on success, or
//   Error on error.
DrupalService.requestCredential = function (options, credentialRequestCompleteCallback) {
  // support both (options, callback) and (callback).
  if (!credentialRequestCompleteCallback && typeof options === 'function') {
    credentialRequestCompleteCallback = options;
    options = {};
  }

  var config = ServiceConfiguration.configurations.findOne({service: 'drupal'});
  if (!config) {
    credentialRequestCompleteCallback && credentialRequestCompleteCallback(
      new ServiceConfiguration.ConfigError());
    return;
  }

  var credentialToken = Random.secret();
  // We need to keep credentialToken across the next two 'steps' so we're adding
  // a credentialToken parameter to the url and the callback url that we'll be returned
  // to by oauth provider.

  var loginStyle = OAuth._loginStyle('drupal', config, options);

  // url to app, enters "step 1" as described in
  // packages/accounts-oauth1-helper/oauth1_server.js
  var loginUrl = Meteor.absoluteUrl(
    '_oauth/drupal/?requestTokenAndRedirect=true'
      + '&state=' + OAuth._stateParam(loginStyle, credentialToken));

  OAuth.launchLogin({
    loginService: "drupal",
    loginStyle: loginStyle,
    loginUrl: loginUrl,
    credentialRequestCompleteCallback: credentialRequestCompleteCallback,
    credentialToken: credentialToken
  });
};

DrupalService.retrieveCredential = function(credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret);
};
