Template.configureLoginServiceDialogForDrupal.helpers({
  siteUrl: function() {
    // Drupal does not recognize localhost as a domain name.
    return Meteor.absoluteUrl({replaceLocalhost: true});
  }
});

Template.configureLoginServiceDialogForDrupal.fields = function () {
  return [
    {property: 'server', label: 'Server'},
    {property: 'consumerKey', label: 'Consumer Key'},
    {property: 'secret', label: 'Consumer Secret'}
  ];
};
