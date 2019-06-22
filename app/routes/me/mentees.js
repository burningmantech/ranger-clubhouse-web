import Route from '@ember/routing/route';
import MeRouteMixin from 'clubhouse/mixins/route/me';

export default class MeMenteesRoute extends Route.extend(MeRouteMixin) {
  model() {
    return this.ajax.request(`person/${this.session.userId}/mentees`).then((result) => result.mentees);
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    const menteeList = model;
    controller.set('menteeList', menteeList);

    // Technically this should be done in the controller, except
    // the list does not dynamic change length.

    let totalPassed = 0, totalBonked = 0;

    menteeList.forEach((year) => {
      year.mentees.forEach((mentee) => {
        if (mentee.mentor_status == 'pass') {
          totalPassed += 1;
        } else {
          totalBonked += 1;
        }
      })
    });

    controller.set('totalMentees', totalPassed + totalBonked);
    controller.set('totalPassed', totalPassed);
    controller.set('totalBonked', totalBonked);
    if (menteeList.length > 0) {
      // server return list in decending order
      controller.set('lastYear', menteeList.firstObject.year);
      controller.set('firstYear', menteeList.lastObject.year);
    } else {
      controller.set('firstYear', 0);
      controller.set('lastYear', 0);
    }
  }
}
