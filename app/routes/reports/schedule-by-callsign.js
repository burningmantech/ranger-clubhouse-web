import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';

export default class ReportsScheduleByCallsignRoute extends ClubhouseRoute {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = requestYear(params);

    this.year = year;
    return this.ajax.request('slot/callsign-schedule-report', { data: { year }});
  }

  setupController(controller, model) {
    const { people, positions, slots} = model;

    Object.keys(slots).forEach( (slotId) => {
      const slot = slots[slotId];
        slot.position = positions[slot.position_id];
    });

    people.forEach((person) => {
      person.slots = person.slot_ids.map((slotId) => slots[slotId]);
    });

    controller.set('year', this.year);
    controller.set('people', people);
    controller.set('isExpanding', false);
    controller.set('expandAll', false);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
