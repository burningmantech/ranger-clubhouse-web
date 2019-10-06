import Component from '@ember/component';
import { action, computed, set } from '@ember/object';

export default class StatusChangeTableComponent extends Component {
  isSubmitting = false;

  @computed('newStatus')
  get isVintage() {
    return this.newStatus == 'vintage';
  }

  @computed('newStatus')
  get isPastProspective() {
    return this.newStatus == 'past prospective';
  }

  @computed('people.@each.selected')
  get selectedCount() {
    return this.people.reduce((total, p) => (p.selected ? 1 : 0) + total, 0);
  }

  @action
  submit() {
    const callsigns = [];

    this.people.forEach((p) => {
      if (p.selected) {
        callsigns.push(p.callsign);
      }
    });

    const records = callsigns.join("\n");
    this.set('isSubmitting', true);

    this.ajax.request('bulk-upload', {
      method: 'POST',
      data: {
        action: this.isVintage ? 'vintage' : this.newStatus,
        records,
        commit: 1
      }
    }).then((results) => {
      let failures = 0;

      results.results.forEach((r) => {
        const person = this.people.find((p) => r.id == p.id);

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
    .finally(() => this.set('isSubmitting', false));
  }

  @action
  toggleAll(checked) {
    this.people.forEach((person) => {
      set(person, 'selected', checked);
    });
  }

}
