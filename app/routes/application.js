import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {action} from '@ember/object';
import { inject as service } from '@ember/service';
import {humanize} from 'ember-cli-string-helpers/helpers/humanize';
import {config} from 'clubhouse/utils/config';
import {UnauthorizedError} from '@ember-data/adapter/error';
import {schedule} from '@ember/runloop';
import ENV from 'clubhouse/config/environment';
import dayjs from 'dayjs';
import RSVP from 'rsvp';

export default class ApplicationRoute extends ClubhouseRoute {
  @service pageProgress;

  constructor() {
    super(...arguments);

    // Kill "The Clubhouse is loading" message in index.html
    const loading = document.querySelector('#app-loading');
    if (loading) {
      loading.remove();
    }

    /*
      When a route (page) transition occurs, scroll the window back to the top,
      and try to record the transition
     */
    this.router.on('routeDidChange', (transition) => {
      // Move the window back to the top when heading to a new route
      schedule('afterRender', () => window.scrollTo(0, 0));

      if (!transition.isActive) {
        this.send('collectTitleTokens', []);
      }

      if (!ENV.logRoutes) {
        // don't bother setting up recording route transitions if not enabled.
        return;
      }

      if (!transition || !transition.to || transition.to.name === 'admin.action-log') {
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
          const person_id = +this.session.userId;

          if (person_id) {
            analytics.append('person_id', person_id);
          }

          const toName = transition.to.name;

          if (toName.startsWith('person.') || toName.startsWith('hq.')) {
            const targetId = +this.router.currentRoute.parent.params.person_id;
            if (!isNaN(targetId)) {
              analytics.append('target_person_id', targetId);
            }
          }
        }
        navigator.sendBeacon(ENV['api-server'] + '/action-log/record', analytics);
      } catch (e) {
        console.log("EXCEPTION ", e);
        // ignore any exceptions.
      }
    });
  }

  /**
   * Retrieve the Clubhouse configuration, and if the user was previously
   * authenticated, load the user's info.
   *
   * beforeModel will be called only once.
   *
   * @param {Transition} transition
   */
  async beforeModel(transition) {
    // If heading to the offline target, simply return
    if (transition.targetName === 'offline') {
      return;
    }

    try {
      /*
         Load up the  configuration, and grab the user info
         if the user was already authenticated and the app is being reloaded such
         as from a page refresh. Otherwise the user info is grabbed by session.handleAuthenticated()
         after the login token is successfully retrieved in {route,controller}/login.js
       */
      const results = await RSVP.hash({
        config: this.ajax.request('config'),
        user: this.session.loadUser() // loadUser will return a resolved promise if the user is not authenticated
      });
      ENV['clientConfig'] = results.config;
    } catch (response) {
      this.house.handleErrorResponse(response);
      // Can't retrieve the configuration. Consider the application
      // offline for the moment.
      transition.abort();
      this.router.transitionTo("offline");
    }
  }

  setupController(controller) {
    const ghd = config('GroundhogDayTime');
    if (ghd) {
      controller.set('groundHogDayTime', dayjs(ghd));
    }
  }

  @action
  logout() {
    this.session.invalidate();
  }

  @action
  willTransition() {
    // Close up the navbar when clicking on a menu item and
    // the navigation bar is not expanded - i.e. when showning
    // on a cellphone.
    this.house.collapse('.navbar-collapse', 'hide');
    return true;
  }

  /**
   * Provide a progress bar on top when transitioning between pages.
   *
   * @param transition
   * @returns {Promise<boolean>}
   */
  @action
  loading(transition) {
    const {pageProgress} = this;
    pageProgress.start(transition.targetName);
    transition.promise.finally(() => pageProgress.done());
    return true;
  }

  @action
  error(error) {
    if (error instanceof UnauthorizedError || error.status === 401) {
      // 401 error - not logged in, or JWT expired.
      if (this.session.isAuthenicated) {
        this.modal.info(null, 'Your session has timed out. Please login again', () => {
          this.session.invalidate();
        });
      } else {
        this.router.transitionTo('login');
      }
      return false;
    }
    // allow the error to transition to ErrorRoute
    return true;
  }

  // Routes can customize their portion of the name with a titleToken property or function,
  // see routes/person.js for an example.
  title(tokens) {
    if (tokens.length === 0 && this.router.currentRouteName) {
      tokens = this.router.currentRouteName.split('.').map((x) => humanize([x]));
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
