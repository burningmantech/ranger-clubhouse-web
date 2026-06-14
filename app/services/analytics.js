import Service, {service} from '@ember/service';
import ENV from 'clubhouse/config/environment';

/**
 * Record a user action event to the API action log via a beacon.
 */

export default class AnalyticsService extends Service {
  @service router;
  @service session;

  /**
   * Record an action
   *
   * @param {string} event
   * @param {Object|null} data
   * @param {string|null} message
   */

  actionRecord(event, data = null, message = null) {
    if (!('sendBeacon' in navigator)) {
      // Too old of browser, or api is blocked by a "security" browser extension.
      return;
    }

    const record = new FormData;

    record.append('event', event);
    if (data) {
      record.append('data', JSON.stringify(data));
    }

    if (message) {
      record.append('message', message);
    }

    if (this.session.isAuthenticated) {
      const person_id = +this.session.userId;

      if (person_id) {
        record.append('person_id', person_id);
      }

      const route = this.router.currentRouteName;

      if (route.startsWith('person.') || route.startsWith('hq.')) {
        const targetId = +this.router.currentRoute.parent?.params?.person_id;
        if (!isNaN(targetId)) {
          record.append('target_person_id', targetId);
        }
      }
      record.append('person_id', this.session.userId);
    }

    navigator.sendBeacon(ENV['api-server'] + '/action-log/record', record);
  }
}
