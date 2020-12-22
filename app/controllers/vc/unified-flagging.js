import Controller from '@ember/controller';
import {action} from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class VcUnifiedFlaggingController extends Controller {
  queryParams = ['year'];

  @tracked people;

  @action
  noteSubmitted(person) {
    return this.ajax.request(`intake/${person.id}/history`, {method: 'GET', data: {year: this.year}})
      .then((result) => { this.people = this.people.map((p) => (p === person ? result.person : p)) } )
      .catch((response) => this.house.handleErrorResponse(response));
  }
}
