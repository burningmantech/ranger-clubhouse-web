import Component from '@glimmer/component';
import {action} from '@ember/object';
import {service} from '@ember/service';

const API_ERRORS = {
  // Can see the contact record, but all the fields are blank.
  'contact-blank': 'Contact record accessible but all fields are blank',

  // Cannot see the contact record at all.
  'contact-inaccessible': 'Contact record is inaccessible',

  // BPGUID is blank.
  'missing-bgpuid': 'BPGUID is missing or inaccessible',

  // Failed to insert into the database
  'create-failure': 'Clubhouse application record creation failed',

  // Record failed to validate before creation.
  'invalid': 'Clubhouse application record failed to validate',
};

const CSV_COLUMNS = [
  {title: 'Salesforce ID', key: 'salesforce_name'},
  {title: 'First Name', key: 'first_name'},
  {title: 'Last Name', key: 'last_name'},
  {title: 'Application Object ID', key: 'salesforce_id'},
  {title: 'Contact Object ID', key: 'contact_id'},
  {title: 'API Error', key: 'api_error_string'},
  {title: 'API Error Details', key: 'api_error_message'},
];

export default class VcApplicationFailedTableComponent extends Component {
  @service house;

  @action
  exportTable() {
    const {records} = this.args;

    records.forEach((r) => {
      r.api_error_string = this.apiErrorToMessage(r.api_error);
    });

    this.house.downloadCsv('clubhouse-application-errors.csv', CSV_COLUMNS, records)
  }

  @action
  apiErrorToMessage(error) {
    return API_ERRORS[error] ?? `Unknown error [${error}]`;
  }
}
