import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import Selectable from 'clubhouse/utils/selectable';
import {tracked} from '@glimmer/tracking';

class PersonSelect extends Selectable {
  @tracked didUnsubmit = false;

  constructor(person) {
    super(person, true);
  }
}

export default class VcAccessDocumentsUnsubmitProvisionsRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('provision/unsubmit-recommendations');
  }

  setupController(controller, {people,year}) {
    controller.people = people.map((p) => new PersonSelect(p));
    controller.year = year;
  }
}
