/** @jsx React.DOM */

var applicationState = require('../state/application.js');
var Badges = require('../lib/api/badges.js');
var allBadges = require('../state/badges.js');
var profileState = require('../state/profile.js');
var EntityStates = require('../lib/entity-states.js');
var CortexReactivityMixin = require('../components/cortex-reactivity.js');
var LoadingPage = require('../components/loading-page.js');
var gravatar = require('gravatar');

var Profile = React.createClass({
  mixins: [CortexReactivityMixin],
  reactToCortices: [profileState(), allBadges()],

  render: function () {
    if (allBadges().loaded.val() !== EntityStates.LOADED
        || profileState().loaded.val() !== EntityStates.LOADED) {
      return <LoadingPage />;
    }

    var userBadges = profileState().badges.val();
    var user = applicationState().auth.user.val();

    return <main className="register">
      <header>
        <div className="row">
          <div className="large-3 columns">
            <h1><img src={'http://placehold.it/400x100&text=Firebots Logo'} /></h1>
          </div>
          <div className="large-9 columns">
            <ul className="button-group right">
              <li><a href="#" className="button">Profile</a></li>
              <li><a href="/logout" className="button">Logout</a></li>
            </ul>
          </div>
        </div>
        <div className="row">
          <div className="large-12 columns">
            <div className="row">
              <div className="large-4 columns">
                <img src={gravatar.url(user.email, {s: '250', r: 'pg'}, true)} />
              </div>
              <div className="large-8 columns">
                <div className="row">
                  <div className="large-12 columns">
                    <h1>{user.first_name + ' ' + user.last_name}</h1>
                  </div>
                </div>
                <div className="row">
                  <div className="large-12 columns">
                    <h1>{(user.technical_group ? user.technical_group : null) +
                      (user.nontechnical_group ? (' / ' + user.nontechnical_group) : null)
                    }</h1>
                  </div>
                </div>
                <div className="row">
                  <div className="large-12 columns">
                    <h1>{user.title ? user.title : null}</h1>
                  </div>
                </div>
              </div>
            </div>
            <hr />
          </div>
        </div>
      </header>

      <section>
        <div className="row">
          <div className="large-6 columns">
            <ul className="small-block-grid-4">
              {this.renderNoBadges(userBadges.no)}
              {this.renderReviewBadges(userBadges.review)}
              {this.renderYesBadges(userBadges.yes)}
            </ul>
          </div>
        </div>
      </section>

    </main>;
  },
  renderBadge: function renderBadge (badge) {
    return <li key={badge.id}>
      <a href={'/badges?id=' + badge.id}><img src={
        'http://placehold.it/200x150&text=' + badge.status} /></a>
    </li>;
  },
  renderNoBadges: function renderNoBadges (no) {
    var self = this;
    return _.map(no, function (badge) {
      return self.renderBadge(badge);
    });
  },
  renderReviewBadges: function renderReviewBadges (review) {
    var self = this;
    return _.map(review, function (badge) {
      return self.renderBadge(badge);
    });
  },
  renderYesBadges: function renderYesBadges (yes) {
    var self = this;
    return _.map(yes, function (badge) {
      return self.renderBadge(badge);
    });
  },
  componentDidMount: function componentDidMount () {
    if (profileState().loaded.val() === EntityStates.LOADED) {
      return false;
    }
    profileState().loaded.set(EntityStates.LOADING);

    var self = this;
    Badges.user_badges(function userBadges (response) {
      if (response.status !== 200) {
        return;
      }

      profileState().set({
        badges: response,
        loaded: EntityStates.LOADED,
      });
    });
  },
});

module.exports = Profile;
