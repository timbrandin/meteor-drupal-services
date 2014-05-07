var Future = Npm.require("fibers/future");
var crypto = Npm.require('crypto');
var querystring = Npm.require('querystring');

DrupalServices = (function() {
  var tokens = new Meteor.Collection(
        "drupal_servicesTokens", {
          _preventAutopublish: true
        }),
      methodNames = {
        'GET': 'get',
        'POST': 'post',
        'PUT': 'put',
        'DELETE': 'del',
      };

  tokens._ensureIndex('type', {unique: 1});

  var _call = function(method, path, options, callback) {
    var config = ServiceConfiguration.configurations.findOne({service: 'drupal'});
    if (!config)
      throw new ServiceConfiguration.ConfigError("Service not configured");

    // Support leaving out options.
    if (typeof options == 'function') {
      callback = options;
    }

    var params = _.extend(options.params || {}, {
      'oauth_consumer_key':     config.consumerKey,
      'oauth_nonce':            Random.id(),
      'oauth_signature_method': 'HMAC-SHA256',
      'oauth_timestamp':        Math.round((+new Date)/1000),
    });

    if (typeof options.key !== 'undefined') {
      _.extend(params, _.pick(options.key, 'oauth_token'));
      var secret = options.key.oauth_token_secret;
    }

    // Reorder params in alphabetical order as Drupal Services wants it.
    params = _.pick.apply(this, _.union(params, _.keys(params).sort()));

    var message = [
      method.toUpperCase(),
      encodeURIComponent(config.server + path),
      encodeURIComponent(querystring.stringify(params))
      ].join('&');

    var key = [
      config.consumerSecret,
      secret || ""
    ].join('&');

    // Sign the request for the callback function to handle.
    var oauth_signature = crypto.createHmac('sha256', key).update(message).digest('base64');

    // Pass along other options to Meteor.http.
    options = _.extend(_.omit(options, 'key', 'params'), {
      params: _.extend(params, {oauth_signature: oauth_signature})
    });

    // Pass along to Meteor.http.
    return Meteor.http[methodNames[method]](config.server + path, {
      params: _.extend(params, {oauth_signature: oauth_signature})
    }, callback);
  };

  SignedHTTP = {};

  // Wrap for asyncronous calls to enable syncronous requests.
  SignedHTTP.call = Meteor._wrapAsync(_call);

  SignedHTTP.get = function() {
    return SignedHTTP.call.apply(this, _.union(['GET'], arguments));
  };

  SignedHTTP.post = function() {
    return SignedHTTP.call.apply(this, _.union(['POST'], arguments));
  };

  SignedHTTP.put = function() {
    return SignedHTTP.call.apply(this, _.union(['PUT'], arguments));
  };

  SignedHTTP.del = function() {
    return SignedHTTP.call.apply(this, _.union(['DELETE'], arguments));
  };

  // Checks whether a string parses as JSON.
  var isJSON = function (str) {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  return {
    getRequestToken: function() {
      var requestToken = tokens.findOne({type: 'request'});
      if (true || !requestToken || requestToken.expire < +new Date) {
        var responseContent;
        try {

          // Ask Drupal for a request token, no key necessary.
          responseContent = SignedHTTP.get('/oauth/request_token').content;

        } catch (err) {
          throw new Error("Failed to complete OAuth handshake with the Drupal Service. " + err.message);
        }

        // Success!! Extract request token.
        requestToken = querystring.parse(responseContent);
        _.extend(requestToken, {
          expire: (+new Date) + 3600,
          type: 'request'
        });

        // Store the request token for later use.
        tokens.upsert({type: 'request'}, requestToken);

        if (!requestToken) {
          throw new Error("Failed to complete OAuth handshake with the Drupal Service " +
            "-- can't find request token in HTTP response. " + responseContent);
        }
      }

      return _.omit(requestToken, '_id');
    },

    getAccessToken: function () {
      var accessToken = tokens.findOne({type: 'access'});
      if (!accessToken || accessToken.expire < +new Date) {
        var requestToken = tokens.findOne({type: 'request'});

        var responseContent;
        try {

          responseContent = SignedHTTP.post('/oauth/access_token', {
            key: requestToken
          }).content;

        } catch (err) {
          throw new Error("Failed to complete OAuth handshake with the Drupal Service. " + err.message);
        }

        // Success! Extract access token.
        accessToken = querystring.parse(responseContent);
        _.extend(accessToken, {
          expire: (+new Date) + 3600,
          type: 'access'
        });

        // Store the access token for later use.
        tokens.upsert({type: 'access'}, accessToken);

        if (!accessToken) {
          throw new Error("Failed to complete OAuth handshake with the Drupal Service " +
            "-- can't find access token in HTTP response. " + responseContent);
        }
      }

      return _.omit(accessToken, '_id');
    },

    getIdentity: function (accessToken) {
      var responseContent;
      try {

        responseContent = SignedHTTP.post('/oauthlogin/api/login/info', {
          key: accessToken
        }).content;

      } catch (err) {
        throw new Error("Failed to complete OAuth handshake with the Drupal Service. " + err.message);
      }

      // If 'responseContent' does not parse as JSON, it is an error.
      if (!isJSON(responseContent)) {
        throw new Error("Failed to complete OAuth handshake with the Drupal Service. " + responseContent);
      }

      return JSON.parse(responseContent);
    },

    isAuthorized: function() {
      return tokens.findOne({type: 'access'}) != null;
    },

    retreive: function(endpoint, resource, params) {
      var accessToken = tokens.findOne({type: 'access'});
      var responseContent;
      try {

        responseContent = SignedHTTP.get('/' + endpoint + '/' + resource, {
          key: accessToken,
          params: params
        }).content;

      } catch (err) {
        throw new Error("Failed to complete OAuth handshake with the Drupal Service. " + err.message);
      }

      // If 'responseContent' does not parse as JSON, it is an error.
      if (!isJSON(responseContent)) {
        throw new Error("Failed to complete OAuth handshake with the Drupal Service. " + responseContent);
      }

      return JSON.parse(responseContent);
    },

    create: function(endpoint, resource) {
      var accessToken = tokens.findOne({type: 'access'});
      var responseContent;
      try {

        responseContent = SignedHTTP.post('/' + config.endpoint + '/' + resource, {
          key: accessToken
        }).content;

      } catch (err) {
        throw new Error("Failed to complete OAuth handshake with the Drupal Service. " + err.message);
      }

      // If 'responseContent' does not parse as JSON, it is an error.
      if (!isJSON(responseContent)) {
        throw new Error("Failed to complete OAuth handshake with the Drupal Service. " + responseContent);
      }

      return JSON.parse(responseContent);
    },

    update: function(endpoint, resource) {
      var accessToken = tokens.findOne({type: 'access'});
      var responseContent;
      try {

        responseContent = SignedHTTP.put('/' + endpoint + '/' + resource, {
          key: accessToken
        }).content;

      } catch (err) {
        throw new Error("Failed to complete OAuth handshake with the Drupal Service. " + err.message);
      }

      // If 'responseContent' does not parse as JSON, it is an error.
      if (!isJSON(responseContent)) {
        throw new Error("Failed to complete OAuth handshake with the Drupal Service. " + responseContent);
      }

      return JSON.parse(responseContent);
    },

    del: function(endpoint, resource) {
      var accessToken = tokens.findOne({type: 'access'});
      var responseContent;
      try {

        responseContent = SignedHTTP.del('/' + endpoint + '/' + resource, {
          key: accessToken,
          content: {}
        }).content;

      } catch (err) {
        throw new Error("Failed to complete OAuth handshake with the Drupal Service. " + err.message);
      }

      // If 'responseContent' does not parse as JSON, it is an error.
      if (!isJSON(responseContent)) {
        throw new Error("Failed to complete OAuth handshake with the Drupal Service. " + responseContent);
      }

      return JSON.parse(responseContent);
    },

    index: function(endpoint, resource, params) {
      var accessToken = tokens.findOne({type: 'access'});
      var responseContent;
      try {

        responseContent = SignedHTTP.get('/' + endpoint + '/' + resource, {
          key: accessToken,
          params: params
        }).content;

      } catch (err) {
        throw new Error("Failed to complete OAuth handshake with the Drupal Service. " + err.message);
      }

      // If 'responseContent' does not parse as JSON, it is an error.
      if (!isJSON(responseContent)) {
        throw new Error("Failed to complete OAuth handshake with the Drupal Service. " + responseContent);
      }

      return JSON.parse(responseContent);
    },
  };
})();

Meteor.methods({
  drupalServicesRequestToken: function() {
    return _.extend(_.pick(DrupalServices.getRequestToken(), 'oauth_token', 'expire'), {
      authorized: DrupalServices.isAuthorized()
    });
  }
});

// Register the Drupal service and use our "drupal" request handler below.
Oauth.registerService('drupal', 'drupal', null, function(query) {
  var accessToken = DrupalServices.getAccessToken();
  var identity = DrupalServices.getIdentity(accessToken);

  var serviceData = {
    id: identity.uid
  };

  // Include all whitelisted fields from Drupal.
  var whitelisted = [];

  var fields = _.pick(identity, whitelisted);
  _.extend(serviceData, fields);

  return {
    serviceData: serviceData,
    options: {
      profile: {
        name: identity.name
      }
    }
  };
});

// This is a recreation of the OAuth request handler from the oauth2 package.
// connect middleware
OAuth._requestHandlers['drupal'] = function (service, query, res) {
  // check if user authorized access
  if (!query.error) {
    // Prepare the login results before returning.

    // Because Drupal doesn't return state or anything, we have to create it.
    _.extend(query, {state: query.oauth_token});

    // Run service-specific handler.
    var oauthResult = service.handleOauthRequest(query);
    var credentialSecret = Random.secret();

    // Store the login result so it can be retrieved in another
    // browser tab by the result handler
    OAuth._storePendingCredential(query.state, {
      serviceName: service.serviceName,
      serviceData: oauthResult.serviceData,
      options: oauthResult.options
    }, credentialSecret);
  }

  // Either close the window, redirect, or render nothing
  // if all else fails
  OAuth._renderOauthResults(res, query, credentialSecret);
};
