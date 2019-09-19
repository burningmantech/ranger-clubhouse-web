import Controller from '@ember/controller';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { CountryLabels } from 'clubhouse/constants/countries';

export default class AdminThankYouCardsController extends Controller {
  queryParams = [ 'year' ];

  @action
  submit() {
    if (isEmpty(this.password)) {
      this.modal.info(null, 'No password entered.');
      return;
    }

    this.set('isSubmitting', true);
    this.ajax.request('timesheet/thank-you', { data: { password: this.password, year: this.year }}).then((result) => {
      this.set('people', result.people);
      this.set('passwordOkay', true);
    }).catch((response) => {
      if (response.status == 403) {
        this.modal.info(null, 'Sorry, the password is incorrect.');
      } else {
        this.house.handleErrorResponse(response);
      }
    }).finally(() => this.set('isSubmitting', false));
  }

  @action
  exportToCSV() {
    const CSV_COLUMNS = [
      { title: 'Team', key: 'team' },
      { title: 'First', key: 'first_name' },
      { title: 'Last', key: 'last_name' },
      { title: 'AKA/ Playa Name', key: 'playa_name' },
      { title: 'Email Address', key: 'email' },
      { title: 'Address', key: 'street1' },
      { title: 'Address 2', key: 'street2' },
      { title: 'City', key: 'city' },
      { title: 'State', key: 'state' },
      { title: 'Country', key: 'country_normalized' },
      { title: 'Zip', key: 'zip' },
      { title: 'BPGUID', key: 'bpguid' }
    ];

    this.people.forEach((person) => {
      person.country_normalized = (CountryLabels[person.country] || person.country).toUpperCase();
      person.team = 'Rangers';
      person.playa_name = `Ranger ${person.callsign}`
    });

    this.house.downloadCsv(`${this.year}-thank-you-cards.csv`, CSV_COLUMNS, this.people);
  }
}
