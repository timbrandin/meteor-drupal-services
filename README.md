Drupal Services [![Build Status](https://travis-ci.org/EventedMind/iron-router.png)](https://travis-ci.org/EventedMind/iron-router)
============================

A meteor package for integration with [Drupal](http://drupal.org) via the [Services](https://drupal.org/project/services) module, and authenticating using
the OAuth module.

Package Dependencies
----------------------

* accounts-base
* accounts-oauth

Drupal Dependencies
----------------------

* [Services](https://drupal.org/project/services) 7.x-3.7
* [OAuth](https://drupal.org/project/oauth) 7.x-3.2
* [OAuth Login Provider](https://drupal.org/project/oauthloginprovider) 7.x-1.1

Currently the OAuth module does not provide a way to determine who is the authorizing user, that's why we need the OAuth Login Provider.

A plus with the OAuth Login Provider is that it also gives us "OAuth Login" which is an OAuth Context that is necessary in all cases using the OAuth module.

Install
-----------
```
mrt install drupal-services
```

```mrt``` is a Meteorite command line tool. Visit [Meteorite's page](http://oortcloud.github.com/meteorite/) to learn more.

Getting started
-----------------

Here are some quick instructions on how to use this package to fetch data from Drupal such as nodes, terms, users etc.

### Requirements for your service endpoints

Which you create yourself in the Services UI.

* Server needs to be able to handle both
  * application/json
  * application/x-www-form-urlencoded
* Authentication currently needs:
  * OAuth Login - as your OAuth Context which is the same as the one your using to authorize your Meteor application for logging in.
  * Default required authentication needs to be 3-legged, haven't tested with anything else yet.

### Code examples

Some typical service call looks like this, they are called from the server and it is currently synchronous, but you could put it in a fiber or use unblock to send them async I guess.

```js
if (Meteor.isServer) {
  // Fetch nodes with node-id 1 and 2.
  var nodes = DrupalService.get('api', 'node', {
    'parameters[nid]': '1,2'
  });

  // Fetch node 1 with all its fields.
  var node = DrupalServices.get('api', 'node/1');
}
```

Features
-----------------

* **OAuth 3-step login procedure** to any Drupal site with Drupal OAuth configured.
* **Signed (HMAC-SHA256) requests** to a configured services in the Services module in any Drupal site.

#### What's next, in a very near future

* Improved error messages.
* Better documentation.

#### Roadmap

Feel free to fork, send pull requests and posting issues.

* Refactoring the package into two new packages where on is using OAuth1Binding.
* Using the package to access open resources without any authorization.
* Multiple services, connecting to multiple Drupal sites.
* Drupal 8 integration.

#### This package also works great with these modules

* [Services Entity API](https://drupal.org/project/services_entity) 7.x-2.0-alpha7
* [Services Views](https://drupal.org/project/services_views) 7.x-1.0
