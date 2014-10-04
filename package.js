Package.describe({
  summary: "An integration with the Drupal Services module",
  version: "1.0.2",
  git: "https://github.com/timbrandin/meteor-drupal-services.git"
});

Package.on_use(function (api, where) {
  api.versionsFrom("METEOR@0.9.0");
  api.use('http', ['client', 'server']);
  api.use('templating', 'client');
  api.use('timbrandin:oauth1-for-apis@1.0.1', ['client', 'server']);
  api.use('oauth', ['client', 'server']);
  api.use('random', 'client');
  api.use('underscore', 'client');
  api.use('service-configuration', ['client', 'server']);

  api.use('timbrandin:package-logging@1.0.4', 'server');

  api.export('DrupalService');

  api.add_files(
    ['timbrandin:drupal-services-configure.html', 'timbrandin:drupal-services-configure.js'],
    'client');

  api.add_files('timbrandin:drupal-services-client.js', 'client');
  api.add_files('timbrandin:drupal-services-server.js', 'server');
});

Package.on_test(function (api) {
  api.use(['tinytest', 'underscore', 'service-configuration', 'test-helpers'], 'server');
  api.use('timbrandin:package-logging@1.0.4', 'server');
  api.use('timbrandin:drupal-services', ['client', 'server']);

  api.add_files('timbrandin:drupal-services_tests.js', 'server');
});
