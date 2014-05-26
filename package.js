Package.describe({
  summary: "An integration with the Drupal Services module"
});

Package.on_use(function (api, where) {
  api.use('oauth', ['client', 'server']);
  api.use('http', ['client', 'server']);
  api.use('underscore', 'client');
  api.use('templating', 'client');
  api.use('random', 'client');
  api.use('service-configuration', ['client', 'server']);

  api.add_files(
    ['drupal-services-configure.html', 'drupal-services-configure.js'],
    'client');

  api.add_files('drupal-services-client.js', 'client');
  api.add_files('drupal-services-server.js', 'server');

  api.export('DrupalServices');
});
