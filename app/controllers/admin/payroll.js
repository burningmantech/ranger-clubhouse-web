import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {validatePresence} from 'ember-changeset-validations/validators';
import validateDateTime from "clubhouse/validators/datetime";
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {hourMinuteFormat} from "clubhouse/helpers/hour-minute-format";
import dayjs from 'dayjs';
import _ from 'lodash';

const DEPARTMENT_CODE = '660';  // the Ranger department code

const CSV_TABLE_COLUMNS = [
  {title: 'Callsign', key: 'callsign'},
  {title: 'First Name', key: 'first_name'},
  {title: 'Last Name', key: 'last_name'},
  {title: 'Employee ID', key: 'employee_id'},
  {title: 'Position', key: 'position_title'},
  {title: 'Paycode', key: 'code'},
  {title: 'Entry Status', key: 'status'},
  {title: 'Orig Start', key: 'orig_on_duty'},
  {title: 'Orig End', key: 'orig_off_duty'},
  {title: 'Duration', key: 'orig_duration'},
  {title: 'First Half Start', key: 'first_on_duty'},
  {title: 'First Half End', key: 'first_off_duty'},
  {title: 'Second Half Start', key: 'second_on_duty'},
  {title: 'Second Half End', key: 'second_off_duty'},
  {title: 'Notes', key: 'notes'}
];

const PUNCH_IN_DAY = 'ID';
const PUNCH_OUT_DAY = 'OD';
const PUNCH_IN_LUNCH = 'IL';
const PUNCH_OUT_LUNCH = 'OL';

const PAYROLL_CSV = [
  {title: 'Employee No.', key: 'employee_id'},
  {title: 'Department', key: 'department'},
  {title: 'Date', key: 'date'},
  {title: 'Punch Time', key: 'time'},
  {title: 'Punch Type', key: 'type'},
  {title: 'Rate Type', blank: true},
  {title: 'Leave Blank', blank: true},
  {title: 'Punch Comment', key: 'comment'},
  {title: 'Sub-Department', key: 'paycode'},
  {title: 'Leave Blank', blank: true},
  {title: 'Leave Blank', blank: true},
  {title: 'Rate', blank: true},
];

export default class AdminPayrollController extends ClubhouseController {
  @tracked datesForm;
  @tracked people;
  @tracked reportWasRun;
  @tracked isSubmitting = false;
  @tracked positions;
  @tracked positionOptions;
  @tracked paycodeOptions;

  @tracked mealBreak;

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
    ["75 mins", 75],
    ["90 mins", 90],
  ];

  breakAfterOptions = [
    ["None", ''],
    ["4 hours", 4],
    ["5 hours", 5],
    ["6 hours", 6],
    ["7 hours", 7],
  ];

  /**
   * How many total entries are being shown?
   *
   * @returns {Number}
   */

  get entryCount() {
    return this.people.reduce((total, person) => total + person.shifts.length, 0);
  }

  /**
   * Generate a payroll report to show.
   *
   * @param {*} model
   * @param {boolean} isValid
   * @returns {Promise<void>}
   */

  @action
  async submitReport(model, isValid) {
    if (!isValid) {
      return;
    }

    if (!model.position_ids.length) {
      this.modal.info('No positions selected', 'Please select one or more positions to report on.');
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
          position_ids: model.position_ids,
          break_after: +model.break_after,
        }
      });
      this.people = people;
      this.reportWasRun = true;
      this.mealBreak = model.break_duration;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Export the raw table
   */

  @action
  exportTable() {
    const rows = [];
    this.people.forEach((person) => {
      person.shifts.forEach((entry) => {
        const row = {
          'callsign': person.callsign,
          'first_name': person.first_name,
          'last_name': person.last_name,
          'employee_id': person.employee_id,
          'position_title': entry.position_title,
          'code': entry.paycode,
          'orig_on_duty': entry.on_duty,
          'orig_off_duty': entry.off_duty,
          'duration': hourMinuteFormat([entry.orig_duration]),
          notes: entry.notes,
        };

        if (entry.still_on_duty) {
          row.status = 'Still On Duty';
        } else if (entry.verified) {
          row.status = 'Verified';
        } else {
          row.status = 'Unverified';
        }

        const adj = entry.meal_adjusted;
        if (adj) {
          row.first_on_duty = adj.first_half.on_duty;
          row.first_off_duty = adj.first_half.off_duty;
          row.second_on_duty = adj.second_half.on_duty;
          row.second_off_duty = adj.second_half.off_duty;
        } else {
          row.first_on_duty = entry.on_duty;
          row.first_off_duty = entry.off_duty;
        }

        rows.push(row);
      })
    });

    this.house.downloadCsv(`${this.house.currentYear()}-payroll-raw.csv`, CSV_TABLE_COLUMNS, rows);
  }

  /**
   * Export the payroll spreadsheet with the adjusted times, or unadjusted.
   *
   * @param adjustEntries
   */

  @action
  exportPayroll(adjustEntries) {
    const rows = [];

    this.people.forEach((person) => {
      person.shifts.forEach((entry) => {
        const adj = entry.meal_adjusted;
        if (adjustEntries) {
          if (adj) {
            // The entry has meals breaks.
            this._punchTheClock(person, rows, entry, adj.first_half.on_duty, adj.first_half.off_duty, PUNCH_IN_DAY, PUNCH_OUT_LUNCH);
            this._punchTheClock(person, rows, entry, adj.second_half.on_duty, adj.second_half.off_duty, PUNCH_IN_LUNCH, PUNCH_OUT_DAY);
          } else {
            // No meal breaks
            this._punchTheClock(person, rows, entry, entry.on_duty, entry.off_duty, PUNCH_IN_DAY, PUNCH_OUT_DAY);
          }
        } else {
          // Export the original timesheet entry as-is.
          this._punchTheClock(person, rows, entry, entry.orig_on_duty, entry.orig_off_duty, PUNCH_IN_DAY, PUNCH_OUT_DAY);
        }
      });
    });

    this.house.downloadCsv(`${this.house.currentYear()}-payroll-${adjustEntries ? 'adjusted' : 'unadjusted'}.csv`, PAYROLL_CSV, rows);
  }

  /**
   * Create a spreadsheet row with the given date-times, and punch codes.
   *
   * @param {*} person
   * @param {[]} rows
   * @param {*} entry
   * @param {string} onDuty
   * @param {string} offDuty
   * @param {string} inCode
   * @param {string} outCode
   * @private
   */

  _punchTheClock(person, rows, entry, onDuty, offDuty, inCode, outCode) {
    const onDutyDT = dayjs(onDuty), offDutyDT = dayjs(offDuty);

    rows.push({
      employee_id: person.employee_id,
      department: DEPARTMENT_CODE,
      date: onDutyDT.format('YYYY-MM-DD'),
      time: onDutyDT.format('HH:mm'),
      type: inCode,
      paycode: entry.paycode,
      comment: `${person.callsign} - ${entry.position_title}`
    });

    rows.push({
      employee_id: person.employee_id,
      date: offDutyDT.format('YYYY-MM-DD'),
      time: offDutyDT.format('HH:mm'),
      type: outCode,
    });
  }

  @action
  selectPayCode(code, setValues) {
    if (code === 'all') {
      setValues(this.positions.map((p) => +p.id));
    } else if (code === 'none') {
      setValues([]);
    } else {
      setValues(this.positions.filter((p) => p.paycode === code).map((p) => +p.id));
    }
  }
}
