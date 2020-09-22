import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ReportsFreakingYearsController extends Controller {
  queryParams = [ 'showAll' ];

  @tracked showAll = 0;
  @tracked expandAll = false;


  get totalPeople() {
    let total = 0;
    this.freaking.forEach((freaks) => total += freaks.people.length);
    return total;
  }

  @action
  toggleExpandAll() {
    this.expandAll = !this.expandAll;
    this.house.toggleAllAccordions(this.expandAll);
  }

  @action
  exportToCsv() {
    const CSV_COLUMNS = [
      { title: 'Callsign', key: 'callsign' },
      { title: 'Last Name', key: 'last_name' },
      { title: 'First Name', key: 'first_name' },
      { title: 'Years', key: 'years' },
      { title: 'First Year', key: 'first_year' },
      { title: 'Last Year', key: 'last_year' },
      { title: `Signed Up In ${this.signed_up_year}`, key: 'signed_up' }
    ];

    const people = [];

    this.freaking.forEach((freaks) => {
      freaks.people.forEach((row) => {
        people.push({
            callsign: row.callsign,
            first_name: row.first_name,
            last_name: row.last_name,
            years: row.years,
            first_year: row.first_year,
            last_year: row.last_year,
            signed_up: row.signed_up ? 'Y' : 'N'
        });
      })
    })

    people.sort((a,b) => {
      const lastCmp = a.last_name.localeCompare(b.last_name);

      if (!lastCmp) {
        return a.first_name.localeCompare(b.first_name);
      } else {
        return lastCmp;
      }
    });

    this.house.downloadCsv(`${this.signed_up_year}-freaking-years.csv`, CSV_COLUMNS, people);
  }
}
