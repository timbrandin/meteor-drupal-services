# API documentation

This is the documentation on how to setup this meteor package together with modules on Drupal, to setup communication to your Drupal site.

## 1. Setup (Drupal)

Add these modules to your Drupal 7.x installation.

* [Services](https://drupal.org/project/services) 7.x-3.10
* **\*** [OAuth](https://drupal.org/project/oauth) 7.x-3.2
* **\*** [OAuth Login Provider](https://drupal.org/project/oauthloginprovider) 7.x-1.1

**\*** Required if your going to do (Authorized, OAuth 1.0a) POST, PUT or DELETE to your service.

> Currently the OAuth module does not provide a way to determine who is the authorizing user, that's why we need the OAuth Login Provider if we want to use three-legged authorization and Drupal as a Login Service (OAuth provider).

> A benefit of using the OAuth Login Provider is that it gives us "OAuth Login" which is a OAuth Context that is necessary in all cases using the OAuth module.

### !!! Notice for the Drupal OAuth module

As it is right now the OAuth module does not implement OAuth 1.0a correctly, but
there's patches to fix this problem:

* [Correct OAuth 1.0a standard: Add missing callback url tracking.](https://www.drupal.org/node/2350645)
* [Correct OAuth 1.0a standard: Missing required oauth_callback_confirmed](https://www.drupal.org/node/2348953)

You can use drush to download these modules.

```
drush dl services oauth oauthloginprovider
```

You can use drush to enable these modules.

```
drush en services oauth oauthloginprovider
```

> And don't forget to check the patches if they have been implemented, as mentioned above.

### Requirements for authorized service endpoints (OAuth 1.0a).

Which you create yourself in the Services UI.

* Server needs to be able to handle both
  * application/json
  * application/x-www-form-urlencoded
* Authentication currently needs:
  * OAuth Login - as your OAuth Context which is the same as the one your using to authorize your Meteor application for logging in.
  * Default required authentication needs to be 3-legged, haven't tested with anything else yet.

## 2. Installation (Meteor)

First you need to add the package to your project:

```
meteor add timbrandin:drupal-service
```

You can now choose from one of the following two methods, or use both!

> Though you can have multiple services for Drupal in your project. But in the current implementation you can only have one authorized OAuth service.

### 2.1. Using the accounts-drupal package.

If your using the login service with Drupal then it's easy. Make sure you have configured everything correctly.

Don't forget to **add** and **configure** the [_accounts-drupal_ package](http://github.com/timbrandin/meteor-accounts-drupal).

```
meteor add timbrandin:accounts-drupal
```

Start by creating the service somewhere on your server.
The only thing you need now is an instance of the DrupalService somewhere on the server in your project.

```
MyService = new DrupalService('api');
```

> Use this instance to call this service only, and create more instances for each new service your create in Drupal.

### 2.2. Using open Drupal Services with NO credentials.

**Notice** that this approach will not work together with the login service, that means you can only is it to to **unauthorized** calls to your service, to for example such things as a public api.

Start by creating the service somewhere on your server.

```
MyService = new DrupalService('public_api', {
  server: 'http://localhost:8080'
});
```

> Use this instance to call this service only, and create more instances for each new service your create in Drupal.

### Notices

The Drupal Service will notify you for missing configuration like server, consumerKey or secret which is required when using the OAuth module for authentication.

## 3. How to use

Lets say we have created a service __MyService__ as above.

### _MyService_.get( _resource_ [, _params_ [, _options_ ]]);

See example usage below.

```
// Get some nodes.
MyService.get('node');

// Get vid for the vocabulary "terms".
var vid = MyService.get('taxonomy_terms', {
  'parameters[machine_name]': 'terms'
});

```

#### Works great with other Services modules

This package also works great most Drupal Services modules.
Here are some examples of implementations.

[Services Views](https://drupal.org/project/services_views) can be used like this.

```
// Get the views emulation of the frontpage.
MyService.get('views/frontpage');
```

[Services Entity API](https://drupal.org/project/services_entity) can be used like this.

```
// Get the full entities for nodes.
Teglet.get('entity_node', {
  'parameters[nid]': '1,2'
});
```

### _MyService_.retrieve( _resource_ [, _params_ [, _options_ ]]);

Alias for: **get**

### _MyService_.post( _resource_ [, _params_ [, _options_ ]]);

See example usage below.

```
// Create a page node.
MyService.post('node', {
  data: {
    type: 'page',
    title: 'New page',
    body: {
      und: [{
        value: 'Lorem impsum dollar sit amet.',
        format: 'plain_text'
      }]
    }
  }
});
```

Using the [Services Entity API](https://drupal.org/project/services_entity) with access to entities other than nodes.

```
// Create another page node.
MyService.post('entity_page', {
  params: {
    type: 'page'
  },
  data: {
    type: 'page',
    title: 'New page',
    body: {
      und: [{
        value: 'Lorem impsum dollar sit amet.',
        format: 'plain_text'
      }]
    }
  }
});
```


### _MyService_.create( _resource_ [, _params_ [, _options_ ]]);

Alias for: **post**

### _MyService_.put( _resource_ [, _params_ [, _options_ ]]);

See example usage below.

```
// Update node with node id (nid): 1".
MyService.put('node/1', {
  data: {
    type: 'page',
    title: 'New page title',
    body: {
      und: [{
        value: 'Lorem impsum dollar sit amet.',
        format: 'plain_text'
      }]
    }
  }
});
```

### _MyService_.update( _resource_ [, _params_ [, _options_ ]]);

Alias for: **put**

### _MyService_.del( _resource_ [, _params_ [, _options_ ]]);

See example usage below.

```
// Delete node with node id (nid): 1".
MyService.del('node/1');
```

### _MyService_.index( _resource_ [, _params_ [, _options_ ]]);

Alias for: **get**

```
// Get full taxonomy tree for vocabulary "terms".
MyService.index('nodes', {
  'parameters[nid]': '1,2'
});
```

### _MyService_.action( _resource_ [, _params_ [, _options_ ]]);

Alias for: **post**

```
// Get full taxonomy tree for vocabulary "terms".
MyService.action('taxonomy_vocabulary/getTree', {
  'vid': vid
});
```
