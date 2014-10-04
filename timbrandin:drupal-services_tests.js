testAsyncMulti('Drupal Services - Misconfigured service throws error.', [function(test, expect) {

  Meteor.setTimeout(expect(function() {
    test.throws(function() {
      new DrupalService();
    }, Error, 'Service did not throw error on missing server configuration.');
  }), 1);

  Meteor.setTimeout(expect(function() {
    test.instanceOf(new DrupalService('api', {
      server: 'server',
      consumerKey: 'consumerKey',
      secret: 'secret'
    }), Object, 'Service does not throw error when server configuration is added.');
  }), 1);

  Meteor.setTimeout(expect(function() {
    test.throws(function() {
      new DrupalService(null, {
        server: 'server',
        consumerKey: 'consumerKey',
        secret: 'secret'
      });
    }, Error, 'Service did not throw error on missing endpoint.');
  }), 1);

  Meteor.setTimeout(expect(function() {
    test.instanceOf(new DrupalService('api', {
      server: 'server',
      consumerKey: 'consumerKey',
      secret: 'secret'
    }), Object, 'Service does not throw error when endpoint is added.');
  }), 1);

  // Wait for configuration setup to return.
  Meteor.setTimeout(expect(function() {
    var options = {
      service: 'drupal',
      server: 'http://10.10.9.228:8888',
      consumerKey: 'zdbZhtcLrMkZ5QEHiGunCz3XCN85J7yr',
      secret: 'tyhmcSZqDt42geagNa8pqVahHk9LUEfF'
    };

    ServiceConfiguration.configurations.insert(options);
  }), 1);

  Meteor.setTimeout(expect(function() {

    new DrupalService('api');

    // test.instanceOf(new DrupalService('api'), Object, 'Service does not throw error when server is added.');
  }), 1);

  Meteor.setTimeout(expect(function() {
    test.throws(function() {
      new DrupalService();
    }, Error, 'Service did not throw error on missing endpoint.');
  }), 1);

  Meteor.setTimeout(expect(function() {
    var server = new DrupalService('api');

    var nodes = server.get('node');

    // var config = ServiceConfiguration.configurations.findOne({service: 'drupal'});
    //
    // test.equal(typeof config, 'object', 'Configuration was not a object as expected.');
    // test.equal(typeof config.server, 'string', 'Server was not a string as expected.');
    //
    // test.throws(function() {
    //   DrupalServices.get();
    // }, Error, 'Service does not throw on missing access-token.');
    //
    // test.throws(function() {
    //   DrupalServices.create();
    // }, Error, 'Service does not throw on missing access-token.');
    //
    // test.throws(function() {
    //   DrupalServices.update();
    // }, Error, 'Service does not throw on missing access-token.');
    //
    // test.throws(function() {
    //   DrupalServices.delete();
    // }, Error, 'Service does not throw on missing access-token.');
    //
    // test.throws(function() {
    //   DrupalServices.action();
    // }, Error, 'Service does not throw on missing access-token.');

  }), 1);

  // Clear away test data.
  ServiceConfiguration.configurations.remove({});

}]);
