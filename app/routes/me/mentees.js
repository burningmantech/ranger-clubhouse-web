import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import _ from 'lodash';

export default class MeMenteesRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request(`person/${this.session.userId}/mentees`).then((result) => result.mentees);
  }

  setupController(controller, model) {
    const menteeList = model;
    controller.set('menteeList', menteeList);

    // Technically this should be done in the controller, except
    // the list does not dynamic change length.

    let totalPassed = 0, totalBonked = 0;

    menteeList.forEach((year) => {
      year.mentees.forEach((mentee) => {
        if (mentee.mentor_status === 'pass') {
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
      controller.set('lastYear', _.first(menteeList).year);
      controller.set('firstYear', _.last(menteeList).year);
    } else {
      controller.set('firstYear', 0);
      controller.set('lastYear', 0);
    }
  }
}
