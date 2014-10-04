Tinytest.add("Misconfigured service logs warnings.", function (test) {
  intercepted = [];
  PLog._intercept(1);
  new DrupalService();

  intercepted = PLog._intercepted();
  test.equal(intercepted.length, 1, 'Service does log on missing server configuration.');
  PLog._rewind();


  intercepted = [];
  PLog._intercept(1);
  test.instanceOf(new DrupalService('api', {
    server: 'server',
    consumerKey: 'consumerKey',
    secret: 'secret'
  }), Object, 'Service returns an object when server configuration is added.');

  intercepted = PLog._intercepted();
  test.equal(intercepted.length, 0, 'Service does NOT log on added server endpoint.');
  PLog._rewind();


  intercepted = [];
  PLog._intercept(1);
  new DrupalService(null, {
    server: 'server',
    consumerKey: 'consumerKey',
    secret: 'secret'
  });

  intercepted = PLog._intercepted();
  test.equal(intercepted.length, 1, 'Service does log on missing server endpoint.');
  PLog._rewind();


  intercepted = [];
  PLog._intercept(1);
  test.instanceOf(new DrupalService('api', {
    server: 'server',
    consumerKey: 'consumerKey',
    secret: 'secret'
  }), Object, 'Service returns an object on correct endpoint.');

  intercepted = PLog._intercepted();
  test.equal(intercepted.length, 0, 'Service does NOT log on added server endpoint.');
  PLog._rewind();


  var options = {
    service: 'drupal',
    server: 'http://10.10.9.228:8888',
    consumerKey: 'zdbZhtcLrMkZ5QEHiGunCz3XCN85J7yr',
    secret: 'tyhmcSZqDt42geagNa8pqVahHk9LUEfF'
  };
  ServiceConfiguration.configurations.insert(options);


  intercepted = [];
  PLog._intercept(1);
  test.instanceOf(new DrupalService('api'), Object, 'Service returns an object on correct endpoint.');

  intercepted = PLog._intercepted();

  test.equal(intercepted.length, 0, 'Service does NOT log on added server endpoint.');
  PLog._rewind();


  intercepted = [];
  PLog._intercept(1);
  new DrupalService();

  intercepted = PLog._intercepted();
  test.equal(intercepted.length, 1, 'Service does log on missing server endpoint.');
  PLog._rewind();

  // Clear away test data.
  ServiceConfiguration.configurations.remove({});

});
