import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';
import {isArray} from '@ember/array';
import {action} from '@ember/object';

/**
 * Base Clubhouse Route
 *
 * Provides heavily used services and permission gating.
 */

export default class ClubhouseRoute extends Route {
  @service ajax;
  @service house;
  @service session;
  @service store;
  @service toast;

  // Ember Routing Service
  @service router;

  /**
   * By default all routes require the user to be logged in.
   *
   * @type {boolean}
   */

  authRequired = true;

  /**
   * Check to see the user holds the role(s) in order to access this route
   *
   * @type {null|int|[]}
   */

  roleRequired = null;

  /**
   * Check to see if the user has one or more roles assigned
   *
   * @returns {boolean} true if the user has permission, otherwise return false and transition to the home page.
   */

  beforeModel(transition) {
    if (this.authRequired && !this.session.requireAuthentication(transition, 'login')) {
      // User is not authenticated
      return false;
    }

    if (!this.roleRequired || this.session.hasRole(this.roleRequired)) {
      // User cleared -- proceed to route
      return super.beforeModel(...arguments);
    }

    // Wah-wah, not authorized!
    this.toast.error('You are not authorized for that action');
    this.router.transitionTo('me.homepage');
    return false;
  }

  @action
  collectTitleTokens(tokens) {
    let titleToken = this.titleToken;
    if (typeof titleToken === 'function') {
      titleToken = titleToken.call(this, this.currentModel);
    }

    if (isArray(titleToken)) {
      tokens.unshift.apply(tokens, titleToken);
    } else if (titleToken) {
      tokens.unshift(titleToken);
    }

    // If `title` exists, it signals the end of the
    // token-collection, and the title is decided right here.
    let title = this.title;
    if (title) {
      document.title = (typeof title === 'function') ? title.call(this, tokens) : title;
      return false;
    } else {
      return true;
    }
  }
}
