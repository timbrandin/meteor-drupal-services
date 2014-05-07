Template.configureLoginServiceDialogForDrupal.siteUrl = function () {
  return Meteor.absoluteUrl('', {
    replaceLocalhost: true
  });
};

Template.configureLoginServiceDialogForDrupal.fields = function () {
  return [
    {property: 'server', label: 'Server'},
    {property: 'consumerKey', label: 'Consumer Key'},
    {property: 'consumerSecret', label: 'Consumer Secret'}
  ];
};
