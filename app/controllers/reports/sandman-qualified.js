import Controller from '@ember/controller';
import { action, computed } from '@ember/object';

export default class ReportsSandmanQualifiedController extends Controller {
  filter = 'all';
  filterOptions = [
    [ 'All', 'all'],
    [ 'Signed Up Qualified', 'signed-up-qualified' ],
    [ 'Signed Up Unqualified', 'signed-up-unqualified' ],
    [ 'Signed Up All', 'signed-up' ],
    [ 'Qualified', 'qualified' ],
    [ 'Unqualified', 'unqualified' ],
  ];

  @computed('filter')
  get viewPeople() {
    const filter = this.filter;
    const people = this.sandpeople;

    switch (filter) {
    case 'all':
      return people;

    case 'qualified':
      return people.filter((p) => (p.is_trained && p.has_experience && p.sandman_affidavit));

    case 'unqualified':
      return people.filter((p) => !(p.is_trained && p.has_experience && p.sandman_affidavit));

    case 'signed-up':
      return people.filter((p) => p.is_signed_up);

    case 'signed-up-qualified':
      return people.filter((p) => (p.is_trained && p.has_experience && p.sandman_affidavit && p.is_signed_up));

    case 'signed-up-unqualified':
      return people.filter((p) => p.is_signed_up && !(p.is_trained && p.has_experience && p.sandman_affidavit));
    }

    return people;
  }

  @computed('sandpeople')
  get qualifiedCount() {
    return this.sandpeople.reduce((total, p) => (((p.is_trained && p.has_experience && p.sandman_affidavit) ? 1 : 0) + total), 0);
  }

  @computed('sandpeople')
  get qualifiedSignedUpCount() {
    return this.sandpeople.reduce((total, p) => (((p.is_signed_up && p.is_trained && p.has_experience && p.sandman_affidavit) ? 1 : 0) + total), 0);
  }

  @computed('sandpeople')
  get unqualifiedSignedUpCount() {
    return this.sandpeople.reduce((total, p) => (((p.is_signed_up && !(p.is_trained && p.has_experience && p.sandman_affidavit)) ? 1 : 0) + total), 0);
  }

  @action
  exportToCSV() {
    const year = this.year;

    const CSV_COLUMNS = [
      { title: 'Callsign', key: 'callsign' },
      { title: `${year} Trained`, key: 'is_trained', yesno: true },
      { title: 'Affidavit', key: 'sandman_affidavit', yesno: true },
      { title: `Experience (>= ${this.cutoff_year})`, key: 'has_experience', yesno: true },
      { title: `${year} Signed Up`, key: 'is_signed_up', yesno: true },
    ];

    this.house.downloadCsv(`${year}-sandman-qualified.csv`, CSV_COLUMNS, this.sandpeople);

  }
}
