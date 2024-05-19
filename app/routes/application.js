import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {action} from '@ember/object';
import {humanize} from 'ember-cli-string-helpers/helpers/humanize';
import {setting} from 'clubhouse/utils/setting';
import {UnauthorizedError} from '@ember-data/adapter/error';
import ENV from 'clubhouse/config/environment';
import dayjs from 'dayjs';
import RSVP from 'rsvp';

export default class ApplicationRoute extends ClubhouseRoute {
  authSetup = false;

  constructor() {
    super(...arguments);

    // Kill "The Clubhouse is loading" message in index.html
    const loading = document.querySelector('#app-loading');
    if (loading) {
      loading.remove();
    }

    this.router.on('routeDidChange', (transition) => this.routeChanged(transition));
  }

  /**
   * When a route (page) transition occurs, scroll the window back to the top,
   * and try to record the transition
   * @param transition
   */

  routeChanged(transition) {
    // Move the window back to the top when heading to a new route
    window.scrollTo(0, 0);

    const burgerMenu = document.querySelector('#top-burger-menu:not(.collapsed)');
    if (burgerMenu) {
      // Mobile menu is open, closeup.
      burgerMenu.click();
    }

    if (!transition.isActive && !transition.isAborted) {
      this.send('collectTitleTokens', []);
    }

    if (!ENV.logRoutes) {
      // don't bother setting up recording route transitions if not enabled.
      return;
    }

    const name = transition?.to?.name;
    if (name === 'admin.action-log' || name === 'offline') {
      return;
    }

    if (!('sendBeacon' in navigator)) {
      // Too old of browser, or api is blocked by a "security" browser extension.
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

      if (!transition.from) {
        data.referrer = document.referrer;
      }

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
      console.error("routeChange logging exception ", e);
      // ignore any exceptions.
    }
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
      this.session.isOffline = true;
      return;
    }

    this.session.isOffline = false;

    if (this.authSetup) {
      return;
    }

    try {
      await this.session.setup();

      /*
         Load up the  configuration, and grab the user info
         if the user was already authenticated and the app is being reloaded such
         as from a page refresh. Otherwise, the user info is grabbed by session.handleAuthenticated()
         after the login token is successfully retrieved in {route,controller}/login.js
      */

      const results = await RSVP.hash({
        config: this.ajax.request('config'),
        user: this.session.loadUser(true)
      });

      ENV['clientConfig'] = results.config;

      this.authSetup = true;
    } catch (response) {
      if (response.status === 401 || response.status === 403) {
        throw response;
      }
      // Can't retrieve the configuration. Consider the application offline for the moment.
      this.router.transitionTo('offline');
    }
  }

  setupController(controller) {
    const ghd = setting('GroundhogDayTime');
    if (ghd) {
      controller.set('groundHogDayTime', dayjs(ghd));
    }
  }

  @action
  logout() {
    this.session.invalidate();
  }

  @action
  error(error) {
    if (error instanceof UnauthorizedError || error.status === 401) {
      // 401 error - not logged in, or session expired.
      this.session.sessionExpiredNotification();
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
    let env = setting('DeploymentEnvironment');
    if (env && env !== 'Production') {
      siteName = `${env} Clubhouse`;
    }
    tokens.push(siteName);
    return tokens.join(' | ');
  }
}
