import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';

export default class ReportsScheduleByPositionRoute extends ClubhouseRoute {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = requestYear(params);

    this.year = year;
    return this.ajax.request('slot/position-schedule-report', { data: { year }});
  }

  setupController(controller, model) {
    const { positions, people }= model;
    positions.forEach((p) => {
      p.activeCount = p.slots.filter((s) => s.active).length;
      p.inactiveCount = p.slots.length - p.activeCount;
      p.slots.forEach((slot) => {
        slot.sign_ups = slot.sign_ups.map((personId) => people[personId]);
        slot.sign_ups.sort((a,b) => a.callsign.localeCompare(b.callsign));
        if (slot.associated) {
          slot.associated.forEach((assoc) => {
            if (!assoc.people) {
              return;
            }
            assoc.people = assoc.people.map((personId) => people[personId])
          });
        }
        if (slot.child) {
          slot.child.people = slot.child.sign_ups.map((personId) => people[personId]);
        }
        if (slot.parent) {
          slot.parent.people = slot.parent.sign_ups.map((personId) => people[personId]);
        }
      })
    });

    controller.set('year', this.year);
    controller.set('positions', positions);
    controller.set('people', people);
    controller.set('isExpanding', false);
    controller.set('expandAll', false);
    controller.set('activeFilter', 'active');
    controller.set('showBulkPositionDialog', false);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
