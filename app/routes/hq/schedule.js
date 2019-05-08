import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class HqScheduleRoute extends Route {
  model() {
    const person_id = this.modelFor('hq').person.id;
    const year = this.house.currentYear();

    this.store.unloadAll('schedule');

    return RSVP.hash({
      slots: this.store.query('schedule',  { person_id, year, shifts_available: 1 }),
      permission: this.ajax.request(`person/${person_id}/schedule/permission`, {data: { year }})
                  .then((results) => results.permission ),
    });
  }

  setupController(controller, model) {
    const hq = this.modelFor('hq');
    super.setupController(...arguments);

    controller.setProperties(model);
    controller.set('person', hq.person);
    controller.set('timesheets', hq.timesheets);
    controller.set('year', this.house.currentYear());
  }
}
