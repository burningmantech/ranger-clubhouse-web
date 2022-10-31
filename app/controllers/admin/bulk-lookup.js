import Controller from '@ember/controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';

const FOUND_CSV_COLUMNS = [
  {title: 'Callsign', key: 'callsign'},
  {title: 'First Name', key: 'first_name'},
  {title: 'Last Name', key: 'last_name'},
  {title: 'Status', key: 'status'},
  {title: 'Email', key: 'email'},
  {title: 'Last Worked', key: 'last_worked'},
  {title: 'Vintage', key: 'vintage'},
  {title: 'Years Worked', key: 'years_worked'},
];

const NOT_FOUND_CSV_COLUMNS = [
  {title: 'Not Found Callsign/Email', key: 'person'}
];

export default class AdminBulkLookupController extends Controller {
  @service ajax;
  @service house;

  @tracked isSubmitting = false;
  @tracked bulkForm;

  @tracked people;
  @tracked peopleFound;
  @tracked peopleNotFound;

  @action
  lookupAction() {
    // Filter out blank lines.
    const people = this.bulkForm.lines.split("\n")
      .map((l) => l.trim())
      .filter((l) => l !== '');

    this.isSubmitting = true;
    this.ajax.request('person/bulk-lookup', {method: 'POST', data: {people}})
      .then(({people}) => {
        this.people = people;
        this.peopleFound = people.filter((p) => p.result === 'success');
        this.peopleNotFound = people.filter((p) => p.result !== 'success').map((p) => p.person);
      })
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false);
  }

  @action
  exportFoundToCSV() {
    this.house.downloadCsv('bulk-lookup-found.csv', FOUND_CSV_COLUMNS, this.peopleFound);
  }

  @action
  exportNotFoundToCSV() {
    const people = this.peopleNotFound.map((person) => ({person}));
    this.house.downloadCsv('bulk-lookup-not-found.csv', NOT_FOUND_CSV_COLUMNS, people);
  }
}
