import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

/*
 * A pure route-router
 *
 * Three possible routes depending on what's happening with the person:
 *
 * If the person is not on site, go to the check in page.
 * If the person is on shift, go to the shift end page.
 * If the person is not on shift, go to the shift start page.
 */

export default class HqIndexRoute extends ClubhouseRoute {
  beforeModel() {
    super.beforeModel(...arguments);

    const person = this.modelFor('hq').person;
    const personId = person.id;

    if (!person.on_site) {
      this.router.transitionTo('hq.site-checkin', personId);
    } else {
      this.router.transitionTo('hq.shift', personId);
    }
  }
}
