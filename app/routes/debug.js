import { VERSION } from '@ember/version';
import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import ENV from 'clubhouse/config/environment';

export default class DebugRoute extends ClubhouseRoute {
  setupController(controller) {
    super.setupController(...arguments);

    controller.set('emberVersion', VERSION); // eslint-disable-line ember/new-module-imports
    controller.set('env', ENV);
    controller.set('browser', navigator.appVersion);
    controller.set('browserVendor', navigator.vendor);

    const viewport = {
      width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
      height:Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    };

    controller.set('viewport', viewport);
  }

}
