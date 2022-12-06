import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import Selectable from 'clubhouse/utils/selectable';
import {tracked} from '@glimmer/tracking';

class PersonSelect extends Selectable {
  @tracked didUnsubmit = false;
  @tracked errors;

  constructor(person) {
    super(person);
    this.selected = true;
  }
}

export default class VcAccessDocumentsUnsubmitProvisionsRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('provision/unsubmit-recommendations');
  }

  setupController(controller, {people}) {
    controller.people = people.map((p) => new PersonSelect(p));
  }
}
