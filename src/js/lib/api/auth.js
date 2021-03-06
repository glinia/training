var API = require('./base.js');
var crypo = require('crypto');

// Authentication API.

// TODO: refactor authentication stuff out of this, make it a simple
var applicationState = require('../../state/application.js');
var persistAuthentication = require('../../lib/authentication.js').persistAuthentication;

var badges = require('../../state/badges.js');
var Badges = require('../api/badges.js');
var EntityStates = require('../../lib/entity-states.js');

//var app = BigNumber(process.env.APP_ID);
var app = 'firebots-web';
var appSecret = process.env.APP_SECRET;
appSecret = 'sjdhf297aaslwur292ASFnsldFJSasdqo26xmDas';


// promise-backed library
var Auth = {
  login: function (email, password, callback) {
    var hmac = crypo.createHmac('sha256', appSecret)
      .update(email)
      .digest('base64');
    var payload = API.encode({
      email: email,
      password: password,
      app: app,
      mac: hmac,
    });

    API.request.post('/auth/login')
      .send(payload)
      .end(API.end(function (res) {
        applicationState().auth.user.set(res.body.user);
        applicationState().auth.token.set(res.body.token);

        persistAuthentication();
        if (callback) callback(res.body);
      }));
  },

  register: function (data, callback) {
    data = API.encode(data);
    API.request.post('/account')
      .send(data)
      .end(API.end(function (res) {
        if (callback) callback(res.body);
      }));
  },

  reset_password_email: function (email, callback) {
    data = API.encode({email: email});
    API.request.post('/auth/forgot-password')
      .send(data)
      .end(API.end(function (res) {
        if (callback) callback(res.body);
      }));
  },

  reset_password: function (token, password, callback) {
    data = API.encode({
      'reset-token': token,
      password: password,
    });
    API.request.post('/auth/forgot-password/reset')
      .send(data)
      .end(API.end(function (res) {
        if (callback) callback(res.body);
      }));
  },
};

module.exports = Auth;
