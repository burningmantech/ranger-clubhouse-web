import Component from '@glimmer/component';
import {action, computed, set} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {inject as service} from '@ember/service';

export default class StatusChangeTableComponent extends Component {
  @service ajax;
  @service house;
  @service toast;

  @tracked isSubmitting = false;

  constructor() {
    super(...arguments);
    const newStatus = this.args.newStatus;

    this.isVintage = (newStatus == 'vintage');
    this.isPastProspective = (newStatus == 'past prospective');
  }

  @computed('args.people.@each.selected')
  get selectedCount() {
    return this.args.people.reduce((total, p) => (p.selected ? 1 : 0) + total, 0);
  }

  @action
  submit() {
    const callsigns = [];
    const people = this.args.people;

    people.forEach((p) => {
      if (p.selected) {
        callsigns.push(p.callsign);
      }
    });

    const records = callsigns.join("\n");
    this.isSubmitting = true;

    this.ajax.request('bulk-upload', {
      method: 'POST',
      data: {
        action: this.isVintage ? 'vintage' : this.args.newStatus,
        records,
        commit: 1
      }
    }).then((results) => {
      let failures = 0;

      results.results.forEach((r) => {
        const person = people.find((p) => r.id == p.id);

        if (person) {
          if (r.status == 'success') {
            set(person, 'converted', true);
            set(person, 'selected', false);
            set(person, 'error', false);
          } else {
            set(person, 'error', true);
            failures++;
          }
        }
      });

      if (failures == 0) {
        this.toast.success('Congratulations! The status change was successful.');
      } else {
        this.toast.error(`${failures} status changes were not successful.`);
      }
    }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false);
  }

  @action
  toggleAll(checked) {
    this.args.people.forEach((person) => {
      set(person, 'selected', checked);
    });
  }
}
