import Controller from '@ember/controller';
import { action, computed } from '@ember-decorators/object';
import { validatePresence } from 'ember-changeset-validations/validators';

export default class MeTimesheetsReviewController extends Controller {
  incorrectTimesheet = null;

  corectionValidations = {
    notes: validatePresence({ presence: true})
  };

  timesheetInfo = {};

  @computed('timesheets')
  get positions() {
    let positionGroups = {};
    const timesheets = this.timesheets;

    timesheets.forEach((sheet) => {
      const title = sheet.position.title;
      let group = positionGroups[title];
      if (!group) {
        group = positionGroups[title] = [];
      }

      group.push(sheet);
    })

    const positionTitles = Object.keys(positionGroups).sort();
    const positions = [];

    positionTitles.forEach(function(title) {
        const group = positionGroups[title];
        const credits = group.reduce((credits, position) => { return position.credits + credits }, 0.0);
        const duration = group.reduce((duration, position) => { return position.duration + duration }, 0);

        positions.push({ title, credits, duration, total: group.length });
    });

    return positions;
  }

  @action
  markCorrectAction(timesheet) {
    timesheet.set('verified', 1);
    timesheet.save().then(() => {
      this.toast.success('The timesheet has been marked as correct.');
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  markIncorrectAction(timesheet) {
    this.set('incorrectTimesheet', timesheet);
  }

  @action
  saveCorrectionAction(model, isValid) {
    if (!isValid) {
      return;
    }

    model.set('verified', 0);
    model.save().then(() => {
      this.set('incorrectTimesheet', null);
      this.toast.success('Your correction note has been submitted.');
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  cancelCorrectionAction() {
    this.set('incorrectTimesheet', null);
  }
}
