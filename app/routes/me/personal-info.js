import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import shirtOptions from 'clubhouse/utils/shirt-options';

export default class MePersonInfoRoute extends ClubhouseRoute {
  async model({review}) {
    this.isReviewing = !!review;
    return {
      shirts: (await this.ajax.request('swag/shirts')).shirts,
      personEvent: await this.store.findRecord('person-event', `${this.session.userId}-${this.session.currentYear()}`, {reload: true}),
      dashboardPeriod: (await this.ajax.request('config/dashboard-period')).period,
      languages: await this.store.query('person-language', { person_id: this.session.userId })
    };
  }

  setupController(controller, {shirts, personEvent, dashboardPeriod, languages}) {
    controller.set('person', this.modelFor('me'));
    controller.set('languages', languages)
    controller.set('isSaved', false);
    controller.set('showUpdateMailingListsDialog', false);
    controller.set('isReviewing', this.isReviewing);
    controller.setProperties(shirtOptions(shirts));

    controller.startedReview = !!personEvent.pii_started_at;
    controller.finishedReview = !!personEvent.pii_finished_at;

    controller.completedReview = false;

    const isReviewing = (dashboardPeriod !== 'after-event') ? !controller.finishedReview : false;
    controller.isReviewing = isReviewing;

    if (isReviewing) {
      controller._updateMilestone('started');
    }
  }
}
