import Component from '@glimmer/component';
import {action, set} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';

export default class StatusChangeTableComponent extends Component {
  @service ajax;
  @service house;
  @service toast;

  @tracked isSubmitting = false;
  @tracked selectedCount = 0;

  constructor() {
    super(...arguments);
    const {newStatus} = this.args;

    this.isVintage = (newStatus === 'vintage');
    this.isPastProspective = (newStatus === 'past prospective');
  }

  _buildSelectedCount() {
    this.selectedCount = this.args.people.reduce((total, p) => (p.selected ? 1 : 0) + total, 0);
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
          if (r.status === 'success') {
            set(person, 'converted', true);
            set(person, 'selected', false);
            set(person, 'error', false);
          } else {
            set(person, 'error', true);
            failures++;
          }
        }
      });

      if (!failures) {
        this.toast.success('Congratulations! The status change was successful.');
      } else {
        this.toast.error(`${failures} status changes were not successful.`);
      }
      this._buildSelectedCount();
    }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false);
  }

  @action
  toggleAll(event) {
    const checked = event.target.checked;
    this.args.people.forEach((person) => {
      set(person, 'selected', checked);
    });
    this._buildSelectedCount();
  }

  @action
  togglePerson(person) {
    set(person, 'selected', !person.selected);
    this._buildSelectedCount();
  }

  @action
  exportToCSV() {
    const {people, newStatus} = this.args;
    const COLUMNS = [
      {key: 'callsign', title: 'Callsign'},
      {key: 'status', title: 'Current Status'},
      {key: 'email', title: 'Email'},
    ];

    if (!this.isVintage) {
      COLUMNS.push({key: 'new_status', title: 'New Status'});
      people.forEach((p) => p.new_status = newStatus);
    }

    if (!this.isPastProspective) {
      COLUMNS.push({key: 'last_year', title: 'Last Year Worked'});
      COLUMNS.push({key: 'years', title: 'Years Worked'});
      COLUMNS.push({key: 'alpha_year', title: 'Alpha Year'});

      if (!this.isVintage) {
        COLUMNS.push({key: 'is_vintage', title: 'Vintage?'});
        people.forEach((p) => p.is_vintage = p.vintage ? 'Y' : '-');
      }
    }

    this.house.downloadCsv(`${this.args.year}-${this.isVintage ? 'vintage' : newStatus.replace(' ', '-')}-convert.csv`, COLUMNS, people);
  }
}
