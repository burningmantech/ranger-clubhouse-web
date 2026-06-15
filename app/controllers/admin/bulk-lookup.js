import Controller from '@ember/controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';

const FOUND_CSV_COLUMNS = [
  {title: 'Callsign', key: 'callsign'},
  {title: 'Legal First Name', key: 'first_name'},
  {title: 'Preferred Name', key: 'preferred_name'},
  {title: 'Last Name', key: 'last_name'},
  {title: 'Status', key: 'status'},
  {title: 'Email', key: 'email'},
  {title: 'Last Worked', key: 'last_worked'},
  {title: 'Vintage', key: 'vintage', yesno: true},
  {title: 'Years Worked', key: 'years_worked'},
  {title: 'Home Phone', key: 'home_phone'},
  {title: 'Address', key: 'street1'},
  {title: 'Apt', key: 'apt'},
  {title: 'Address 2', key: 'street2'},
  {title: 'City', key: 'city'},
  {title: 'State', key: 'state'},
  {title: 'Country', key: 'country'},
  {title: 'Zip', key: 'zip'},
];

const NOT_FOUND_CSV_COLUMNS = [
  {title: 'Not Found Callsign/Email', key: 'person'}
];

export default class AdminBulkLookupController extends Controller {
  @service ajax;
  @service errors;
  @service download;
  @tracked isSubmitting = false;
  @tracked bulkForm;

  @tracked people;
  @tracked peopleFound;
  @tracked peopleNotFound;

  @action
  async lookupAction() {
    // Filter out blank lines.
    const people = this.bulkForm.lines.split("\n")
      .map((l) => l.trim())
      .filter((l) => l !== '');

    this.isSubmitting = true;
    try {
      const result = await this.ajax.request('person/bulk-lookup', {method: 'POST', data: {people}});
      this.people = result.people;
      this.peopleFound = result.people.filter((p) => p.result === 'success');
      this.peopleNotFound = result.people.filter((p) => p.result !== 'success').map((p) => p.person);
    } catch (response) {
      this.errors.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  exportFoundToCSV() {
    this.download.downloadCsv('bulk-lookup-found.csv', FOUND_CSV_COLUMNS, this.peopleFound);
  }

  @action
  exportNotFoundToCSV() {
    const people = this.peopleNotFound.map((person) => ({person}));
    this.download.downloadCsv('bulk-lookup-not-found.csv', NOT_FOUND_CSV_COLUMNS, people);
  }
}
