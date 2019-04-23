import Route from '@ember/routing/route';
import { action } from '@ember-decorators/object';
import setCookie from 'clubhouse/utils/set-cookie';

import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import ENV from 'clubhouse/config/environment';

import $ from 'jquery';

export default class ApplicationRoute extends Route.extend(ApplicationRouteMixin) {
  beforeModel(transition) {
    // If heading to the offline target, simply return
    if (transition.targetName == 'offline') {
      return;
    }
    // Has the app configuration been loaded?
    if (ENV['clientConfig']) {
      return this.setCurrentUser();
    }

    // Fetch the configuration
    return this.ajax.request('config').then((result) => {
      ENV['clientConfig'] = result;
      return this.setCurrentUser();
    }).catch((response) => {
      this.house.handleErrorResponse(response);
      // Can't retrieve the configuration. Consider the application
      // offline for the moment.
      transition.abort();
      this.transitionTo("offline");
    });
  }

  // Logout button or ember-simple-auth trigger
  invalidateSession() {
    this.house.clearStorage();
    this.session.invalidate();
  }

  sessionAuthenticated() {
    // don't call the parent method - it will attempt to route
    // before everything is setup.
    //this._super(...arguments);
    return this.setCurrentUser().then(() => {
      return this.transitionTo('me.overview');
    });
  }

  setCurrentUser() {
    if (!this.session.isAuthenticated) {
      this.transitionTo('login');
      return Promise.resolve();
    }

    return this.session.loadUser().catch((response) => {
      this.transitionTo('/login');
      this.house.handleErrorResponse(response);
    });
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.set('user', this.session.user);
    const searchPrefs = this.house.getKey('person-search-prefs');
    if (searchPrefs) {
      controller.searchForm.setProperties(searchPrefs);
    }
  }

  @action
  logout() {
    setCookie('C2AUTHTOKEN', 'nothing', 0);
    this.house.clearStorage();
    this.session.invalidate();
  }

  @action
  didTransition() {
    // Close up the navbar when clicking on a menu item and
    // the navigation bar is not expanded - i.e. when showning
    // on a cellphone.
    $('header a.dropdown-item').on('click', function(){
        $('.navbar-collapse').collapse('hide');
     });
  }
}
