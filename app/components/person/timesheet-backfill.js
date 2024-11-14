import Component from '@glimmer/component';
import {service} from '@ember/service';
import EmberObject, {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {DIRT} from "clubhouse/constants/positions";
import {STATUS_VERIFIED} from "clubhouse/models/timesheet";

export default class PersonTimesheetBackfillComponent extends Component {
  @service ajax;
  @service house;
  @service modal;
  @service session;
  @service store;
  @service toast;

  @tracked isSubmitting = false;
  @tracked yearsForm;
  @tracked isAdmin;

  constructor() {
    super(...arguments);

    this.yearOptions = [];
    for (let i = 1996; i <= 2010; i++) {
      this.yearOptions.push(i);
    }
  }

  @action
  openDialog() {
    this.yearsForm = EmberObject.create({years: []});
  }

  @action
  cancelDialog() {
    this.yearsForm = null;
  }

  @action
  async submitYears(model) {
    if (!model.years.length) {
      this.modal.info('No Years Selected', 'Select one or more years to back fill.');
      return;
    }

    this.isSubmitting = true;
    const {person} = this.args;
    const exists = [];
    const backFill = [];

    for (let year of model.years) {
      try {
        const {timesheet} = await this.ajax.request('timesheet', {
          data: {
            person_id: person.id,
            year
          }
        });
        if (timesheet.length) {
          exists.push(year);
        } else {
          backFill.push(year);
        }
      } catch (response) {
        this.house.handleErrorResponse(response);
        this.isSubmitting = false;
        return;
      }
    }

    if (!backFill.length) {
      this.modal.info('Already back filled',
        'The year(s) selected to back fill already have one or more timesheet entries to represent the year(s). No new entries have been created.');
      this.isSubmitting = false;
      return;
    }

    try {
      for (let year of backFill) {
        const entry = this.store.createRecord('timesheet', {
          person_id: person.id,
          position_id: DIRT,
          on_duty: `${year}-01-01 12:00:00`,
          off_duty: `${year}-01-01 12:01:00`,
          review_status: STATUS_VERIFIED,
          additional_admin_notes: `Back fill entry created to represent year ${year}`,
          suppress_duration_warning: true,
        });

        await entry.save();
      }

      await person.reload();  // Pick up new timesheet entry years
      let message = `<p>The following year(s) were back filled: ${backFill.join(',')}</p>`;
      if (exists.length) {
        message += `<p>The following year(s) were NOT back filled because timesheet entries already exists for the given year(s): ${exists.join(',')}</p>`;
      }
      this.modal.info('Year(s) Back Filled', message);
      this.yearsForm = null;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }
}
