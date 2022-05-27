import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {validateNumber, validatePresence} from 'ember-changeset-validations/validators';
import currentYear from 'clubhouse/utils/current-year';
import laborDay from 'clubhouse/utils/labor-day';
import validateDateTime from 'clubhouse/validators/datetime';
import dayjs from 'dayjs';
import _ from 'lodash';

const ALL_DAYS = {id: 'all', title: 'All Days'};

class CopyParams {
  @tracked deltaDays = 0;
  @tracked deltaHours = 0;
  @tracked deltaMinutes = 0;
  @tracked newPositionId = 0;

  constructor(obj) {
    Object.assign(this, obj);
  }
}

class CopySourcePosition {
  // create with {controller: this, id: â¦, title: â¦, credits: [â¦]}
  @tracked credits;

  constructor(obj) {
    Object.assign(this, obj);
  }

  get allSelected() {
    return this.credits.every((c) => c.selected);
  }

  get selectedCredits() {
    return this.credits.filter((c) => c.selected);
  }
}

class CopySourceCredit {
  // create with {controller: this, source: creditModel}
  @tracked selected = true;
  @tracked source;
  @tracked controller;

  constructor(obj) {
    Object.assign(this, obj);
  }

  get checkboxId() {
    return `copy-credit-${this.source.id}`;
  }

  get start_time() {
    return this.adjustTime(this.source.start_time);
  }

  get end_time() {
    return this.adjustTime(this.source.end_time);
  }

  adjustTime(sourceDate) {
    const delta = this.controller.copyParams;
    return dayjs(sourceDate).add({
      days: delta.deltaDays,
      hours: delta.deltaHours,
      minutes: delta.deltaMinutes
    }).format('ddd MMM DD [@] HH:mm YYYY');
  }
}

export default class AdminCreditsController extends ClubhouseController {
  queryParams = ['year'];

  @tracked dayFilter = 'all';

  creditValidations = {
    start_time: [validateDateTime({presence: true, before: 'end_time'})],
    end_time: [validateDateTime({presence: true, after: 'start_time'})],
    description: [validatePresence({presence: true})],
    position_id: [validatePresence({presence: true})],
    credits_per_hour: [validatePresence({presence: true})],
  };

  copyValidations = {
    deltaDays: [validateNumber({integer: true})],
    deltaHours: [validateNumber({integer: true})],
    deltaMinutes: [validateNumber({integer: true})],
  };

  @tracked isCopying = false;

  @tracked isCreditSubmitting = false;
  @tracked credit = null;

  @tracked viewCredits = [];
  @tracked positionCredits = [];
  @tracked positionsOpened = {};

  // Copy credits
  @tracked presentYear;
  @tracked selectedYearLaborDay;
  @tracked presentYearLaborDay;
  @tracked laborDayDiff;
  @tracked copyParams;
  @tracked copySourcePositions;
  @tracked badCredits;

  _buildDisplay() {
    this._buildViewCredits();
    this._buildPositionCredits();
  }

  _buildViewCredits() {
    let credits = this.credits;
    const dayFilter = this.dayFilter;

    if (dayFilter !== 'all') {
      credits = credits.filter((p) => p.creditDay === dayFilter);
    }

    this.viewCredits = credits.sortBy('start_time');
  }

  get dayOptions() {
    const unique = this.credits.uniqBy('creditDay').mapBy('creditDay');
    const days = unique.map((day) => ({id: day, title: dayjs(day).format('ddd MMM DD')}));
    days.unshift(ALL_DAYS);
    return days;
  }

  @action
  changeDayFilter(value) {
    this.dayFilter = value;
    this._buildDisplay();
  }

  @action
  positionClicked(position, opened) {
    this.positionsOpened[position.position_id] = opened;
  }

  _buildPositionCredits() {
    const groups = [];

    this.viewCredits.forEach((credit) => {
      const group = groups.find((g) => g.position_id === credit.position_id);
      if (group) {
        group.credits.push(credit);
      } else {
        groups.push({
          title: credit.position ? credit.positionTitle : `Position #${credit.position_id}`,
          isNonExistent: !credit.position,
          position_id: credit.position_id,
          credits: [credit]
        });
      }
    });

    this.positionCredits = _.sortBy(groups, 'title');
  }

  get positionOptions() {
    return this.positions.map((p) => [p.title, p.id]);
  }

  get positionOptionsForCopy() {
    return [['(same position)', 0], ...this.positions.map((p) => [p.title, p.id])];
  }

  @action
  newCredit() {
    this.credit = this.store.createRecord('position-credit', {position_ids: []});
  }

  @action
  editCredit(credit) {
    this.credit = credit;
  }

  @action
  async saveCredit(model, isValid) {
    if (!isValid) {
      return;
    }

    if (model.isNew) {
      this.isCreditSubmitting = true;
      const positionIds = model.position_id;
      // Bulk creation - loop through all select position ids
      for (let i = 0; i < positionIds.length; i++) {
        const newCredit = this.store.createRecord('position-credit', {
          position_id: positionIds[i],
          start_time: model.start_time,
          end_time: model.end_time,
          description: model.description,
          credits_per_hour: model.credits_per_hour
        });

        try {
          await newCredit.save();
          this.toast.success(`${newCredit.positionTitle} position credit created.`);
        } catch (response) {
          this.house.handleErrorResponse(response, model);
          break;
        }
      }

      this._updateCredits()
        .then(() => this.credit = null)
        .finally(() => this.isCreditSubmitting = false);
    } else {
      this.house.saveModel(model, 'The position credit has been successfully updated.', () => {
        this.credit = null;
        this._buildDisplay();
      });
    }
  }

  _updateCredits() {
    return this.credits.update()
      .then(() => this._buildDisplay())
      .catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  deleteCredit(credit) {
    this.modal.confirm(
      'Confirm Credit Deletion',
      `Are you sure you want to delete Position ${credit.positionTitle} ${credit.description} Time ${credit.start_time} - ${credit.end_time} Credits ${credit.credits_per_hour}?`,
      () => {
        credit.destroyRecord()
          .then(() => {
            this.credits.removeObject(credit);
            this._buildDisplay();
            this.toast.success('Credit has been deleted.')
          })
          .catch((response) => this.house.handleErrorResponse(response))
      }
    );
  }

  @action
  cancelCredit() {
    this.credit = null;
  }

  @action
  startCopy(selectedPositionId = 0) {
    selectedPositionId = +selectedPositionId;
    this.presentYear = currentYear();
    const selectedLaborDay = laborDay(this.year);
    const presentLaborDay = laborDay(this.presentYear);
    this.selectedYearLaborDay = selectedLaborDay.format('MMMM Do');
    this.presentYearLaborDay = presentLaborDay.format('MMMM Do');
    this.laborDayDiff = presentLaborDay.diff(selectedLaborDay, 'days');
    let sourceCredits = this.viewCredits;

    if (selectedPositionId > 0) {
      sourceCredits = sourceCredits.filter((p) => p.position_id === selectedPositionId);
    }

    // Filter out credits with no backing position
    this.badCredits = sourceCredits.filter((p) => !p.position);
    sourceCredits = sourceCredits.filter((p) => p.position);

    let copyPositions = [];
    _.forOwn(_.groupBy(sourceCredits, 'position_id'),
      (credits, positionId) => {
        copyPositions.push(new CopySourcePosition({
          id: positionId,
          title: credits[0].positionTitle,
          controller: this,
          credits: credits.map((c) => new CopySourceCredit({controller: this, source: c}))
        }))
      });
    copyPositions = copyPositions.sortBy('title');
    if (copyPositions.length === 1) {
      copyPositions[0].expanded = true;
    }
    this.copyParams = new CopyParams({deltaDays: this.laborDayDiff});
    this.copySourcePositions = copyPositions;
  }

  get copySelectedCreditCount() {
    return _.sumBy(this.copySourcePositions, (p) => p.selectedCredits.length);
  }

  @action
  cancelCopy() {
    this.copySourcePositions = null;
    this.copyParams = null;
  }

  @action
  performCopy() {
    const params = this.copyParams;
    const sourceCredits = this.copySourcePositions.flatMap((p) => p.selectedCredits);
    const sourceIds = sourceCredits.map((c) => c.source.id);
    if (sourceIds.length === 0) {
      this.toast.warning('No credits selected to copy; no changes made');
      return;
    }

    if (params.newPositionId > 0 && sourceCredits.map((c) => c.source.position_id).uniq().length > 1) {
      this.toast.warning("Can't copy credits from multiple positions to a new position");
      return;
    }

    const data = {ids: sourceIds};
    ['deltaDays', 'deltaHours', 'deltaMinutes', 'newPositionId'].forEach((key) => {
      if (params[key] != 0) {
        data[key] = params[key];
      }
    });
    this.isCopying = true;
    this.ajax.request(`position-credit/copy`, {method: 'POST', data: data})
      .then((result) => {
        if (!result.position_credit.length) {
          this.toast.error('No credits copied');
          return;
        }
        this.toast.success(`Copied ${result.position_credit.length} credits`);
        // refresh the list
        this._updateCredits()
          .finally(() => {
            this.isCopying = false
            this.copySourcePositions = null;
            this.copyParams = null;

          });
      }).catch((response) => {
      this.house.handleErrorResponse(response);
      this.isCopying = false;
      this.copySourcePositions = null;
      this.copyParams = null;
    });
  }

  @action
  copyPositionSelectAll(position) {
    // if all are selected, deselect all; otherwise select all
    const value = !position.allSelected;
    position.credits.forEach((c) => c.selected = value);
  }
}
