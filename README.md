Drupal Services [![Build Status](https://travis-ci.org/timbrandin/meteor-drupal-services.png)](https://travis-ci.org/timbrandin/meteor-drupal-services)
============================

A servers side package for integrating with [Drupal](http://drupal.org) via the [Services](https://drupal.org/project/services) module, and authenticating using
the [OAuth](https://drupal.org/project/oauth) module.

Install
-----------
```
meteor add timbrandin:drupal-services
```

Getting started
-----------------

Here are some quick instructions on how to use this package to fetch data from Drupal such as nodes, terms, users etc.

### Code examples

Some typical service call looks like this, they are called from the server.

```js
if (Meteor.isServer) {
  MySite = new DrupalServices('api');

  // Fetch nodes with node-id 1 and 2.
  var nodes = MySite.get('node', {
    'parameters[nid]': '1,2'
  });

  // Fetch node 1 with all its fields.
  var node = MySite.get('node/1');
}
```

Features
-----------------

* **OAuth 2-step consumer requests** to resources configured with the Services module.
* **OAuth 3-step login procedure** to _any Drupal site_ configured with the OAuth Login Service.
* **Signed (HMAC-SHA1) requests** to a configured services in the Services module in any Drupal site.

#### Roadmap

Feel free to fork, send pull requests and post issues on Github.

* **DONE** Refactor package to use [OAuth1Binding](https://github.com/meteor/meteor/blob/devel/packages/oauth1/oauth1_binding.js).
* **DONE** Using the package to access open resources without any authorization.
* **DONE** Multiple services, connecting to multiple Drupal sites.
* API documentation.
* Configurable authorization.
* Drupal 8 integration.
