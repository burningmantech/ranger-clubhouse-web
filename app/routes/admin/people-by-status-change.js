import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';

export default class AdminPeopleByStatusChangeRoute extends Route {
  queryParams = {
    period: { refreshModel: true }
  };

  beforeModel() {
    super.beforeModel(...arguments);
    this.house.roleCheck(Role.ADMIN);
  }

  model( { period }) {
    const date = new Date();
    const  month = date.getMonth(), day = date.getDay();
    let year = date.getFullYear();

    // (comment originally from Clubhouse 1 - Person::selectByStatusChange)
    // There are 2 use cases for service calculations:
    // case #1: current-date or case #2: next-event
    //
    // For use case #1: Are there any Rangers who need to change status RIGHT NOW?
    // That is, based on the info in the Clubhouse, their current status is incorrect.
    // Example: Hubcap is marked as "active" but when we look, we see that he hasn't
    // rangered in the last three years, so he should actually be immediately marked
    // as inactive. (Note that the report is not responsible for changing his status,
    // just reporting that somebody needs to do this.) The purpose of this use case
    // is for us to be able to update the Clubhouse, typically a month or so after the event.
    //
    // For use case #2: Which Rangers will change status AFTER THE COMING EVENT?
    // That is, their status right now is correct, but after the next event, it should change.
    // Example: it's January 2016. Hubcap is marked as active. He last Rangered in 2013 but
    // not in 2014 or 2015. Right now, he is correctly marked as active. However, after
    // the 2016 event, assuming he doesn't Ranger, he will become inactive, because in
    // October 2016 he won't have worked the last three events (2014, 2015, and 2016).
    // The purpose of this use case is to warn people, "Hey, buddy, you're about to become
    // retired or inactive or whatever".
    // Since years change in January, and events happen at the end of
    // August, we need to take this into account when making service calculations
    // if the current month is Oct, Nov, or Dec we treat the current year as next year

    // Note: javascript months are 0-11. Because, reasons.
    // Anytime after September 7th -- look at the next year.
    if ((month >= 8 && day > 7) || month >= 9) {
      year++;
    }

    if (period == 'next-event') {
      year++;
    }

    this.set('year', year)
    return this.ajax.request('person/by-status-change', { data: { year }});
  }

  setupController(controller, model) {
    controller.setProperties(model);
    controller.set('year', this.year);
  }
}
