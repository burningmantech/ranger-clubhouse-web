import Component from '@glimmer/component';
import {action} from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class UnifiedFlaggingComponent extends Component {
  queryParams=['year'];
  @service ajax;
  @service house;

  @tracked people = [];

  constructor() {
    super(...arguments);
    this.people = this.args.people;
  }
  @action
  noteSubmitted(person) {
    return this.ajax.request(`intake/${person.id}/history`, {method: 'GET', data: {year: this.args.year}})
      .then((result) => { this.people = this.people.map((p) => (p === person ? result.person : p)) } )
      .catch((response) => this.house.handleErrorResponse(response));
  }
}
