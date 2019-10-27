import Route from '@ember/routing/route';
import { action, setProperties } from '@ember/object';
import { humanize } from 'ember-cli-string-helpers/helpers/humanize';
import { inject as service } from '@ember/service';
import { config } from 'clubhouse/utils/config';

import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import ENV from 'clubhouse/config/environment';

import $ from 'jquery';

export default class ApplicationRoute extends Route.extend(ApplicationRouteMixin) {
  @service router;

  init() {
    super.init(...arguments);

    if (!ENV.logRoutes || !navigator.sendBeacon) {
      // Not logging routes or sendBeacon is not available.
      return;
    }

    // Record route transitions
    this.router.on('routeDidChange', (transition) => {
      if (!transition || !transition.to || transition.to.name == 'admin.action-log') {
        return;
      }

      try {
        const analytics = new FormData;
        let pathname = window.location.pathname;

        if (window.location.search) {
          pathname += window.location.search;
        }

        analytics.append('event', 'client-route');
        analytics.append('message', pathname);
        const data = {
          build_timestamp: ENV.APP.buildTimestamp,
          route_to: transition.to.name,
          route_from: transition.from ? transition.from.name : 'unknown',
          pathname,
        };

        analytics.append('data', JSON.stringify(data));
        if (this.session.isAuthenticated) {
          const person_id = this.session.userId;

          if (person_id) {
            analytics.append('person_id', person_id);
          }
        }
        navigator.sendBeacon(ENV['api-server'] + '/action-log/record', analytics);
      } catch (e) {
        // ignore any exceptions.
      }
    });
  }

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

  async sessionAuthenticated() {
    await this.setCurrentUser();
    super.sessionAuthenticated(...arguments);
  }

  setCurrentUser() {
    if (!this.session.isAuthenticated) {
      return Promise.resolve();
    }

    return this.session.loadUser().then(() => {
      this.controllerFor('application').setup();
    }).catch(() => this.session.invalidate());
  }

  setupController(controller) {
    super.setupController(...arguments);

    if (this.session.isAuthenticated) {
      const searchPrefs = this.house.getKey('person-search-prefs');
      if (searchPrefs && controller.searchForm) {
        setProperties(controller.searchForm, searchPrefs);
      }
    }
  }

  @action
  logout() {
    this.house.clearStorage();
    this.session.invalidate();
  }

  @action
  willTransition() {
    // Close up the navbar when clicking on a menu item and
    // the navigation bar is not expanded - i.e. when showning
    // on a cellphone.
    $('.navbar-collapse').collapse('hide');
  }

  // Dynamic page title: https://github.com/mike-north/ember-cli-document-title-northm
  // Routes can customize their portion of the name with a titleToken property or function,
  // see routes/person.js for an example.
  title(tokens) {
    if (tokens.length === 0) {
      tokens = this.get('router').currentRouteName.split('.').map((x) => humanize([x]));
      if (tokens[tokens.length - 1] === 'Index') {
        tokens.pop();
      }
    }
    tokens = tokens.reverse();
    let siteName = 'Ranger Clubhouse';
    let env = config('DeploymentEnvironment');
    if (env && env !== 'Production') {
      siteName = `${env} Clubhouse`;
    }
    tokens.push(siteName);
    return tokens.join(' | ');
  }
}
