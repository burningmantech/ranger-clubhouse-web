import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import { set } from '@ember/object';
import { filterBy } from '@ember-decorators/object/computed';

export default class MeAlertsController extends Controller {
  alerts = [];

  @filterBy('alerts', 'on_playa', true) onPlayaAlerts;
  @filterBy('alerts', 'on_playa', false) offPlayaAlerts;

  @action
  setAll(column, value) {
    const field = column == 'email' ? 'use_email' : 'use_sms';
    this.alerts.forEach((alert) =>  {
      set(alert, field, value);
    })
  }

  @action
  updatePreferences() {
    const alerts = this.alerts.map((alert) => { return {
      id: alert.id,
      use_sms: alert.use_sms ? 1 : 0,
      use_email: alert.use_email ? 1 : 0,
    }});

    this.ajax.request(`person/${this.person.id}/alerts`, {
          method: 'PATCH',
          data: { alerts }
    }).then(() => { this.toast.success('Alert Preferences have been successfully update.') })
    .catch((response) => { this.house.handleErrorResponse(response) });
  }
}
