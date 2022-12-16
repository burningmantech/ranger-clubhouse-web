import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import shirtOptions from 'clubhouse/utils/shirt-options';

export default class MePersonInfoRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('swag/shirts');
  }

  setupController(controller, {shirts}) {
    controller.set('person', this.modelFor('me'));
    controller.set('isSaved', false);
    controller.set('showUpdateMailingListsDialog', false);
    controller.setProperties(shirtOptions(shirts));
  }
}
