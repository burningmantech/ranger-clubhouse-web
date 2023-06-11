import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {validatePresence} from 'ember-changeset-validations/validators';
import validateDateTime from "clubhouse/validators/datetime";
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {hourMinuteFormat} from "clubhouse/helpers/hour-minute-format";

const CSV_TABLE_COLUMNS = [
  {title: 'Callsign', key: 'callsign'},
  {title: 'First Name', key: 'first_name'},
  {title: 'Last Name', key: 'last_name'},
  {title: 'Position', key: 'position_title'},
  {title: 'Orig Start', key: 'orig_on_duty'},
  {title: 'Orig End', key: 'orig_off_duty'},
  {title: 'Orig Duration', key: 'orig_duration'},
  {title: 'First Half Start', key: 'first_on_duty'},
  {title: 'First Half End', key: 'first_off_duty'},
  {title: 'Meal Break', key: 'meal'},
  {title: 'Second Half Start', key: 'second_on_duty'},
  {title: 'Second Half End', key: 'second_off_duty'},
  {title: 'Total Adj. Duration', key: 'adj_duration'},
  {title: 'Notes', key: 'notes'}
];

export default class AdminPayrollController extends ClubhouseController {
  @tracked datesForm;
  @tracked people;
  @tracked reportWasRun;
  @tracked isSubmitting = false;
  @tracked positions;
  @tracked positionOptions;

  datesValidation = {
    start_time: [
      validatePresence({presence: true, message: 'Enter a starting date and time.'}),
      validateDateTime({before: 'end_time'})
    ],

    end_time: [
      validatePresence({presence: true, message: 'Enter an ending date and time.'}),
      validateDateTime({after: 'start_time'})
    ],
  }

  breakDurationOptions = [
    ["30 mins", 30],
    ["60 mins", 60],
    ["90 mins", 90],
  ];

  hourCapOptions = [
    ["No cap", 0],
    ["7 hours", 7],
    ["8 hours", 8],
    ["9 hours", 9],
    ["10 hours", 10],
    ["11 hours", 11],
    ["12 hours", 12],
    ["13 hours", 13],
    ["14 hours", 14],
    ["15 hours", 15],
    ["16 hours", 16],
  ];

  get entryCount() {
    return this.people.reduce((total, person) => total + person.shifts.length, 0);
  }

  @action
  async submitReport(model, isValid) {
    if (!isValid) {
      return;
    }

    this.reportWasRun = false;
    this.isSubmitting = true;

    try {
      const {people} = await this.ajax.request('timesheet/payroll', {
        data: {
          start_time: model.start_time,
          end_time: model.end_time,
          break_duration: model.break_duration,
          hour_cap: model.hour_cap,
        }
      });
      this.people = people;
      this.reportWasRun = true;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  exportTable() {
    const rows = [];
    this.people.forEach((person) => {
      person.shifts.forEach((entry) => {
        const row = {
          'callsign': person.callsign,
          'first_name': person.first_name,
          'last_name': person.last_name,
          'position_title': entry.position_title,
          'position_code': entry.position_code,
          'orig_on_duty': entry.on_duty,
          'orig_off_duty': entry.off_duty,
          'orig_duration': hourMinuteFormat([entry.orig_duration]),
          'adj_duration': hourMinuteFormat([entry.duration]),
          notes: entry.notes,
        };
        rows.push(row);

        const adj = entry.meal_adjusted;
        if (adj) {
          row.first_on_duty = adj.first_half.on_duty;
          row.first_off_duty = adj.first_half.off_duty;
          row.second_on_duty = adj.second_half.on_duty;
          row.second_off_duty = adj.second_half.off_duty;
          row.meal = adj.meal;
        } else {
          row.first_on_duty = entry.on_duty;
          row.first_off_duty = entry.off_duty;
        }
      })
    });

    return this.house.downloadCsv(`${this.house.currentYear()}-payroll.csv`, CSV_TABLE_COLUMNS, rows);
  }

  @action
  exportUnadjustPayroll() {

  }
}
