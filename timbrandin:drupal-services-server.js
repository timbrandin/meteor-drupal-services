var url = Npm.require("url");

DrupalService = function(endpoint, options) {
  var self = this;
  this.server = "";
  this.endpoint = endpoint;
  this.consumerKey = "";
  this.secret = "";

  // Add defaults from a possibly configured Drupal login service.
  _getDrupalDefaults();

  // Extend defaults and validate.
  if (options) _.extend(this, options);
  this._validate(this);

  // Helper to get settings for the configured login service.
  function _getDrupalDefaults() {
    var config = ServiceConfiguration.configurations.findOne({service: 'drupal'});
    if (config) {
      _.extend(self, config);
    }
    else {
      // If Drupal wasn't already configured, wait for new configuration settings.
      ServiceConfiguration.configurations.find({service: 'drupal'}).observe({
        added: function(config) {
          if (!self.server) {
            _.extend(self, config);
          }
        }
      });
    }
  };
};

DrupalService.prototype = {
  constructor: DrupalService,

  _validate: function(settings) {
    // Warn about missing configuration.
    if (!settings.server && !DrupalService.ready) {
      PLog.warn("Drupal Service: Missing server or unconfigured login service");
      return false;
    }
    if (!settings.endpoint) {
      PLog.warn("Drupal Service: Missing endpoint for " + this.server);
      return false;
    }
    if (!settings.consumerKey) {
      PLog.warn("Drupal Service: Missing consumerKey for " + this.server);
      return false;
    }
    if (!settings.secret) {
      this.configured = false;
      PLog.warn("Drupal Service: Missing secret for " + this.server);
      return false;
    }

    return true;
  },

  _getDefaults: function(options) {
    var settings = [];
    // Move defaults into temporary settings.
    _.extend(settings, this);

    // Add a default user if we're not in a publish function.
    var currentInvocation = DDP._CurrentInvocation.get();
	  if (!settings.user && currentInvocation) {
      settings.user = Meteor.user();
    }

    // Extend defaults with options.
    if (options) _.extend(settings, options);

    return settings;
  },

  _getUrl: function(resource, options) {
    var settings = this._getDefaults(options);

    // Remove trailing slashes for the endpoint.
    var endpoint = settings.endpoint.replace(/\/+$/, '');

    // Remove beginning slashes for the resource.
    var endpoint = settings.endpoint.replace(/^\/+/, '');

    // Return a joined url with server, endpoint and resource.
    return [settings.server, endpoint, resource].join('/');
  },

  _getBinding: function(options) {
    var settings = this._getDefaults(options);

    if (settings.user && settings.user.services.drupal) {
      // Get urls for the currently used server.
      var urls = getUrlsForServer(settings.server);

      // Create a config object.
      var config = _.pick(settings, 'consumerKey', 'secret');

      var oauthBinding = new OAuth1Binding(config, urls);

      oauthBinding.accessToken = OAuth.openSecret(settings.user.services.drupal.accessToken);
      oauthBinding.accessTokenSecret = OAuth.openSecret(settings.user.services.drupal.accessTokenSecret);

      return oauthBinding;
    }
    else {
      if (!settings.user) {
        PLog.info("Drupal Service: A user is not defined or logged in, defaulting to unsigned HTTP without credentials for " + settings.server);
      }
      else if (!settings.user.services.drupal) {
        PLog.warn("Drupal Service: User credentails is missing or the user has not authorized the login service, defaulting to unsigned HTTP without credentials." + settings.server);
      }
      return HTTP;
    }
  },

  _call: function(http_method, resource, params, options) {
    try {
      var options = options || {};

      // Extend settings with options for just this call.
      var settings = this._getDefaults(options);

      // Get a new binding to the service.
      var binding = this._getBinding(options);

      // Make sure we have valid settings.
      if (this._validate(settings)) {

        // Call the service.
        var result = binding.call(http_method,
          this._getUrl(resource, options),
          params
        ).data;

        return result;
      }
    }
    catch(e) {
      PLog.warn(e.toString());
    }
  },

  setDefaults: function(options) {
    // Extend defaults and validate.
    if (options) _.extend(this, options);
    this._validate(this);
  },

  isAuthorized: function() {
    var settings = this._getDefaults();

    // Add a default user if we're not in a publish function and isn't already defined.
    var currentInvocation = DDP._CurrentInvocation.get();
    if (!settings.user && currentInvocation) {
      settings.user = Meteor.user();
    }

    return settings.user
      && settings.user.services
      && settings.user.services.drupal
      && settings.user.services.drupal.accessToken
      && settings.user.services.drupal.accessTokenSecret;
  },

  get: function(resource, params, options) {
    return this._call('GET', resource, params, options);
  },
  post: function(resource, params, options) {
    return this._call('POST', resource, params, options);
  },
  put: function(resource, params, options) {
    return this._call('PUT', resource, params, options);
  },
  del: function(resource, params, options) {
    params = params || {};
    // XXX HTTP accepts both params with {} and with {params: {}}.
    // XXX But here when we're adding content we don't want to loose params, as HTTP
    // XXX won't be able to read them if we don't put them in the inner {params: {}}.
    if (!params.params) {
      params.params = params;
    }
    // "Delete" in the HTTP package needs an empty content parameter, to pass things through.
    params = _.extend({content: {}}, params);
    return this._call('DELETE', resource, params, options);
  },
  retreive: function(resource, params, options) {
    return this._call('GET', resource, params, options);
  },
  create: function(resource, params, options) {
    return this._call('POST', resource, params, options);
  },
  update: function(resource, params, options) {
    return this._call('PUT', resource, params, options);
  },
  index: function(resource, params, options) {
    return this._call('GET', resource, params, options);
  },
  action: function(resource, params, options) {
    return this._call('POST', resource, params, options);
  }
};

Meteor.startup(function() {
  var drupalServiceCursor = ServiceConfiguration.configurations.find({service: 'drupal'});
  drupalServiceCursor.observe({
    added: function(service) {
      // Remove trailing slashes.
      if (!DrupalService.ready) {
        var server = service.server.replace(/\/$/, '');
        var urls = getUrlsForServer(server);
        createOAuthBindings(server, urls);
        DrupalService.ready = true;
      }
    }
  });
});

function getUrlsForServer(server) {
  return {
    requestToken: server + '/oauth/request_token',
    authorize: server + '/oauth/authorize',
    accessToken: server + '/oauth/access_token',
    authenticate: server + '/oauth/authorize'
  };
}

function buildState(loginStyle, credentialToken) {
  var state = {
    loginStyle: loginStyle,
    credentialToken: credentialToken,
    isCordova: Meteor.isCordova
  };

  if (loginStyle === 'redirect')
    state.redirectUrl = '' + window.location;

  // Encode base64 as not all login services URI-encode the state
  // parameter when they pass it back to us.
  // Use the 'base64' package here because 'btoa' isn't supported in IE8/9.
  return Base64.encode(JSON.stringify(state));
}

function createOAuthBindings(server, urls) {
  OAuth.registerService('drupal', 1, urls, function(oauthBinding) {
    var identity = oauthBinding.post(server + '/oauthlogin/api/login/info').data;

    var serviceData = {
      id: identity.uid,
      accessToken: OAuth.sealSecret(oauthBinding.accessToken),
      accessTokenSecret: OAuth.sealSecret(oauthBinding.accessTokenSecret)
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
}
