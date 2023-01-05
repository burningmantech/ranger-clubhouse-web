import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

const CSV_COLUMNS = [
  {title: 'Training', key: 'description'},
  {title: 'Date', key: 'begins'},
  {title: '% Filled', key: 'filled'},
  {title: 'Seats', key: 'max'},
  {title: 'Signed Up', key: 'signed_up'},
  {title: 'PNVs', key: 'pnv_count'},
  {title: 'Returning', key: 'veteran_count'},
  {title: 'Auditors', key: 'auditor_count'},
  {title: 'Passed', key: 'passed'},
  {title: 'Not Passed', key: 'not_passed'},
  {title: 'Trainers', key: 'trainer_count'},
];

export default class TrainingCapacityController extends ClubhouseController {
  @tracked training;
  @tracked slots;

  @tracked uniqueTrainers;

  @tracked totalSeats;
  @tracked totalSignups;
  @tracked totalMax;
  @tracked totalPNVs;
  @tracked totalVets;
  @tracked totalAuditors;
  @tracked totalPassed;
  @tracked totalNotPassed;

  queryParams = ['year'];

  get notCurrentYear() {
    return (+this.year !== this.house.currentYear());
  }

  get totalFullPercentage() {
    const slots = this.slots;
    const signups = slots.reduce((total, slot) => slot.signed_up + total, 0);
    const seats = slots.reduce((total, slot) => slot.max + total, 0);

    return Math.round((signups / seats) * 100);
  }

  bgColor(filled) {
    if (filled >= 90) {
      return 'text-bg-danger';
    } else if (filled >= 70) {
      return 'text-bg-warning';
    } else {
      return '';
    }
  }

  @action
  exportToCSV() {
    const rows = this.slots.map((s) => ({ ...s, filled: `${s.filled}%`}));

    rows.push({
      description: '',
      begins: 'Totals',
      filled: `${this.totalFullPercentage}%`,
      max: this.totalMax,
      signed_up: this.totalSignups,
      pnv_count: this.totalPNVs,
      veteran_count: this.totalVets,
      auditor_count: this.totalAuditors,
      passed: this.totalPassed,
      not_passed: this.totalNotPassed,
      trainer_count: `${this.uniqueTrainers}\n(unique)`,
    });

    this.house.downloadCsv(`${this.year}-training-capacity.csv`, CSV_COLUMNS, rows);
  }
}
