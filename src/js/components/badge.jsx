/** @jsx React.DOM */

var Badges = require('../lib/api/badges.js');
var desiredBadge = require('../state/badge.js');
var EntityStates = require('../lib/entity-states.js');
var CortexReactivityMixin = require('../components/cortex-reactivity.js');
var LoadingPage = require('../components/loading-page.js');
var allBadges = require('../state/badges.js');
var applicationState = require('../state/application.js');

var Badge = React.createClass({
  mixins: [CortexReactivityMixin],
  reactToCortices: [desiredBadge()],

  render: function () {
    if (desiredBadge().loaded.val() !== EntityStates.LOADED) {
      return <LoadingPage />;
    }

    var badge = desiredBadge().badge.val();
    var pathToBadge = 'http://3501-training-2014-us-west-2.s3-website-us-west-2'
      + '.amazonaws.com/badges/' + badge.id + '.jpg';

    return <main className="badge">
      <div>
        <div className="row">
          <br /><br />
          <div className="large-4 column">
            <img width={300}
              src={pathToBadge} />
            <br /><br />
            <div className="row">
              <hr />
              <div className="large-6 column">
                <p>Category:</p>
                <p>Level:</p>
                <p>Verifier(s):</p>
              </div>
              <div className="large-6 column">
                <p>{badge.category}</p>
                <p>{badge.level}</p>
                <p>Mr. Dobervich<br />Danny</p>
              </div>
              <hr />
              {applicationState().auth.user.permissions.val() === 'mentor'
                || applicationState().auth.user.permissions.val() === 'lead'
                ? <a className="button" href={'/badge/' + badge.id + '/edit'}
                  >Edit badge</a>
                : null}
            </div>
          </div>
          <div className="large-8 column">
            <div className="row"><h1>{badge.name} <small>{badge.subcategory
              } series</small></h1></div>
            <br />
            <h3 className="subheader">Requirements:</h3>
            <p>{badge.description}</p>
            <h3 className="subheader">Learning methods:</h3>
            <p>{badge.learning_method}</p>
            <br />
            <div className="row">
              <div className="large-6 columns">
                <h3 className="subheader">Resources:</h3>
                <ul>
                  <li><a href="http://maps.google.com">Google Maps</a>
                  </li><li><a href="http://http://www.starbucks.com/store-locator">Starbucks Store Locator</a>
                  </li><li><a href="https://chaseonline.chase.com/">Chase Bank Account</a>
                  </li></ul>
              </div>
              <div className="large-6 columns">
                <h3 className="subheader">Need help? </h3>
                <p>Ask someone who's already received the badge. Or ask one of
                  the verifiers to be a <a href="http://en.wikipedia.org/wiki/HTTP_302">human 302.</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>;
  },
  loadBadge: function loadBadge () {
    var self = this;

    var cachedBadge;
    if (allBadges().badges.val()) {
      cachedBadge = _.find(allBadges().badges.val(), function (badge) {
        return badge.id.toS() === self.props.id;
      });

      if (cachedBadge) {
        desiredBadge().set({
          badge: cachedBadge,
          loaded: EntityStates.LOADED,
        });

        return;
      }
    }

    if (desiredBadge().badge.id
      && desiredBadge().badge.id.toS() === this.props.id
      && desiredBadge().loaded.val() === EntityStates.LOADED) {
      return false;
    }
    desiredBadge().loaded.set(EntityStates.LOADING);

    Badges.badge(this.props.id, function all (response) {
      if (response.status !== 200) {
        return;
      }

      desiredBadge().set({
        badge: response.badge,
        loaded: EntityStates.LOADED,
      });
    });
  },
  componentDidMount: function componentDidMount () {
    this.loadBadge();
  },
});

module.exports = Badge;
