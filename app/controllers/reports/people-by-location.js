import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {CountryLabels} from 'clubhouse/constants/countries';
import {cached, tracked} from '@glimmer/tracking';
import {later, schedule} from '@ember/runloop';

import _ from 'lodash';

export default class ReportsPeopleByLocationController extends ClubhouseController {
  @tracked filter;
  @tracked people;
  @tracked isRendering;
  @tracked isExpanding = false;
  @tracked expandAll = false;

  accordions = [];

  get filterOptions() {
    const year = this.year;

    return [
      ['All', 'all'],
      [`Signed Up in ${year}`, 'signed-up'],
      [`Worked in ${year}`, 'worked'],
      [`Signed Up AND Worked in ${year}`, 'active'],
      [`Signed Up OR Worked ${year}`, 'any'],
    ];
  }

  @cached
  get countries() {
    const list = _.map(_.groupBy(this.viewPeople, 'country'), (people, country) => {
      return {
        country,
        full_name: CountryLabels[country] || country,
        people
      }
    });
    list.sort((a, b) => a.full_name.localeCompare(b.full_name));
    return list;
  }

  @cached
  get viewPeople() {
    const filter = this.filter;
    const people = this.people;

    switch (filter) {
      case 'signed-up':
        return people.filter((p) => p.signed_up);
      case 'worked':
        return people.filter((p) => p.worked);
      case 'active':
        return people.filter((p) => p.worked && p.signed_up);
      case 'any':
        return people.filter((p) => p.worked || p.signed_up);
      default:
        return people;
    }
  }

  @action
  toggleExpandAll() {
    this.expandAll = !this.expandAll;
    this.isExpanding = true;
    this.toggleAccordion(0);
  }

  toggleAccordion(idx) {
    schedule('afterRender', () => {
      if (idx >= this.accordions.length) {
        this.isExpanding = false;
        return;
      }
      const accordion = this.accordions[idx];
      if (!accordion) {
        return;
      }
      if (accordion.isOpen !== this.expandAll) {
        accordion.onClickAction();
      }

      later(() => schedule('afterRender', () => this.toggleAccordion(idx + 1)), 1);
    });
  }

  @action
  onAccordionInsert(accordion) {
    this.accordions.push(accordion);
  }

  @action
  onAccordionDestroy(accordion) {
    _.pull(this.accordions, accordion);
  }

  @action
  exportAllToCSV() {
    this._exportToCSV(this.viewPeople, 'all');
  }

  @action
  exportCountryToCSV(country) {
    this._exportToCSV(country.people, country.full_name);
  }

  _exportToCSV(people, suffix) {
    const year = this.year;

    const CSV_COLUMNS = [
      {title: 'Callsign', key: 'callsign'},
      {title: 'First Name', key: 'first_name'},
      {title: 'Last Name', key: 'last_name'},
      {title: 'Email', key: 'email'},
      {title: 'Status', key: 'status'},
      {title: 'City', key: 'city'},
      {title: 'State', key: 'state'},
      {title: 'Postal Code', key: 'zip'},
      {title: 'Country', key: 'country'},
      {title: `${year} Signed Up`, key: 'did_sign_up'},
      {title: `${year} Worked`, key: 'did_work'}
    ];

    people.forEach((person) => {
      person.did_sign_up = person.signed_up ? 'Y' : 'N';
      person.did_work = person.worked ? 'Y' : 'N';
    });

    return this.house.downloadCsv(`${year}-people-location-${suffix.replace(/ /g, '-')}`, CSV_COLUMNS, people);
  }

  @action
  updateFilter(value) {
    this.isRendering = true;
    later(this, () => {
      this.filter = value;
      schedule('afterRender', () => this.isRendering = false);
    }, 1);
  }
}
