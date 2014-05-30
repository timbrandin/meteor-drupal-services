Tinytest.add('Drupal Services - Unconfigured service throws error.', function(test) {
  test.throws(function() {
    DrupalServices.get();
  }, Error, 'Service did not throw error on unconfigured service.');

  test.throws(function() {
    DrupalServices.create();
  }, Error, 'Service did not throw error on unconfigured service.');

  test.throws(function() {
    DrupalServices.update();
  }, Error, 'Service did not throw error on unconfigured service.');

  test.throws(function() {
    DrupalServices.delete();
  }, Error, 'Service did not throw error on unconfigured service.');

  test.throws(function() {
    DrupalServices.action();
  }, Error, 'Service did not throw error on unconfigured service.');
});

testAsyncMulti('Drupal Services - Misconfigured service throws error.', [function(test, expect) {
  // Wait for configuration setup to return.
  Meteor.setTimeout(expect(function() {
    var options = {
      service: 'drupal',
      server: 'http://10.10.9.207:8080',
      consumerKey: 'TMUn7qMiUW24kf4LujQdwWLifxHrW7Kb',
      consumerSecret: '5zU4toxL8MqcMTPquAmmZT3n2tZaDgHn'
    };

    ServiceConfiguration.configurations.insert(options);
  }), 1);

  Meteor.setTimeout(expect(function() {
    var config = ServiceConfiguration.configurations.findOne({service: 'drupal'});

    test.equal(typeof config, 'object', 'Configuration was not a object as expected.');
    test.equal(typeof config.server, 'string', 'Server was not a string as expected.');

    test.throws(function() {
      DrupalServices.get();
    }, Error, 'Service does not throw on missing access-token.');

    test.throws(function() {
      DrupalServices.create();
    }, Error, 'Service does not throw on missing access-token.');

    test.throws(function() {
      DrupalServices.update();
    }, Error, 'Service does not throw on missing access-token.');

    test.throws(function() {
      DrupalServices.delete();
    }, Error, 'Service does not throw on missing access-token.');

    test.throws(function() {
      DrupalServices.action();
    }, Error, 'Service does not throw on missing access-token.');

  }), 1);

}]);
