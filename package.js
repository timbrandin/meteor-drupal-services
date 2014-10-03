Package.describe({
  summary: "An integration with the Drupal Services module",
  version: "1.0.0",
  git: "https://github.com/timbrandin/meteor-drupal-services.git"
});

Package.on_use(function (api, where) {
  api.versionsFrom("METEOR@0.9.0");
  api.use('http', ['client', 'server']);
  api.use('templating', 'client');
  // api.use('timbrandin:drupal-oauth1', ['client', 'server']);
  api.use('oauth1', ['client', 'server']);
  api.use('oauth', ['client', 'server']);
  api.use('random', 'client');
  api.use('underscore', 'client');
  api.use('service-configuration', ['client', 'server']);
  api.use('base64', 'server');

  api.export('DrupalServices');

  api.add_files(
    ['drupal-services-configure.html', 'drupal-services-configure.js'],
    'client');

  api.add_files('drupal-services-client.js', 'client');
  api.add_files('drupal-services-server.js', 'server');
});

Package.on_test(function (api) {
  api.use(["timbrandin:drupal-services", 'service-configuration', 'tinytest', 'test-helpers']);

  api.add_files('drupal-services_tests.js', 'server');
});
