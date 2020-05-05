import Controller from '@ember/controller';
import EmberObject from '@ember/object';
import {action, computed} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {filterBy} from '@ember/object/computed';
import {validateNumber, validatePresence} from 'ember-changeset-validations/validators';
import currentYear from 'clubhouse/utils/current-year';
import laborDay from 'clubhouse/utils/labor-day';
import validateDateTime from 'clubhouse/validators/datetime';
import moment from 'moment';
import _ from 'lodash';

const allDays = {id: 'all', title: 'All Days'};
const allPositions = {id: 'all', title: 'All Positions'};

class CopyParams extends EmberObject {
  deltaDays = 0;
  deltaHours = 0;
  deltaMinutes = 0;
  newPositionId = 0;
}

class CopySourcePosition extends EmberObject {
  // create with {controller: this, id: â¦, title: â¦, credits: [â¦]}
  expanded = false;

  @computed('credits.@each.selected')
  get allSelected() {
    return this.credits.every((c) => c.selected);
  }

  @filterBy('credits', 'selected', true) selectedCredits;
}

class CopySourceCredit extends EmberObject {
  // create with {controller: this, source: creditModel}
  selected = true;

  @computed('controller.copyParams.{deltaDays,deltaHours,deltaMinutes}', 'source.start_time')
  get start_time() {
    return this.adjustTime(this.source.start_time);
  }

  @computed('controller.copyParams.{deltaDays,deltaHours,deltaMinutes}', 'source.end_time')
  get end_time() {
    return this.adjustTime(this.source.end_time);
  }

  adjustTime(sourceDate) {
    const delta = this.controller.copyParams;
    return moment(sourceDate).add({
      days: delta.deltaDays,
      hours: delta.deltaHours,
      minutes: delta.deltaMinutes
    }).format('ddd MMM DD [@] HH:mm YYYY');
  }
}

export default class AdminCreditsController extends Controller {
  queryParams = ['year'];

  dayFilter = 'all';
  positionFilter = 'all';

  creditValidations = {
    start_time: [ validateDateTime({presence: true, before: 'end_time'}) ],
    end_time: [ validateDateTime({presence: true, after: 'start_time'}) ],
    description: [ validatePresence({presence: true}) ],
    position_id: [ validatePresence({presence: true}) ],
    credits_per_hour: [ validatePresence({presence: true}) ],
  };

  copyValidations = {
    deltaDays: [ validateNumber({integer: true}) ],
    deltaHours: [ validateNumber({integer: true}) ],
    deltaMinutes: [ validateNumber({integer: true}) ],
  };

  @tracked isCopying = false;

  @tracked isCreditSubmitting = false;
  @tracked credit = null;

  @computed('credits[]', 'credits.@each.{position_id,start_time}', 'dayFilter', 'positionFilter')
  get viewCredits() {
    let credits = this.credits;
    const dayFilter = this.dayFilter;
    const positionFilter = this.positionFilter;

    if (positionFilter != 'all') {
      credits = credits.filter((p) => p.position_id == positionFilter);
    }

    if (dayFilter != 'all') {
      if (dayFilter == 'upcoming') {
        credits = credits.filter((p) => p.has_started == false);
      } else {
        credits = credits.filter((p) => p.creditDay == dayFilter);
      }
    }

    return credits.sortBy('start_time');
  }

  @computed('credits.@each.start_time')
  get dayOptions() {
    const unique = this.credits.uniqBy('creditDay').mapBy('creditDay');
    const days = [allDays];

    unique.forEach((day) => days.pushObject({id: day, title: moment(day).format('ddd MMM DD')}));

    return days;
  }

  @computed('viewCredits', 'dayFilter', 'positionFilter')
  get creditGroups() {
    let credits = this.viewCredits;
    let groups = [];

    credits.forEach(function (credit) {
      const title = credit.position ? credit.positionTitle : `Position #${credit.position_id}`;
      let group = groups.findBy('title', title);

      if (group) {
        group.credits.push(credit);
      } else {
        groups.push({title, position_id: credit.position_id, credits: [credit]});
      }
    });

    return groups.sortBy('title');
  }

  @computed('credits.@each.position_id')
  get filterPositionOptions() {
    const unique = this.credits.uniqBy('positionTitle');

    let options = unique.map((credit) => {
      return {id: credit.position_id, title: credit.positionTitle};
    });

    options = options.sortBy('title');
    options.unshift(allPositions);
    return options;
  }

  @computed('positions')
  get positionOptions() {
    return this.positions.map((p) => [p.title, p.id]);
  }

  @computed('positions')
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

      this.credits.update().then(() => {
        this.credit = null;
      }).catch((response) => this.house.handleErrorResponse(response))
        .finally(() => this.isCreditSubmitting = false);
    } else {
      this.house.saveModel(model, 'The position credit has been successfully updated.', () => {
        this.credit = null;
      });
    }
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
            this.toast.success('Credit has been deleted.')
          })
          .catch((response) => this.house.handleErrorResponse(response))
      }
    );
  }

  @action
  cancelCredit(model) {
    if (!model.get('isDirty')) {
      this.set('credit', null);
      return;
    }

    this.modal.confirm('Unsaved Changes', 'The changes have not been saved. Are you sure you wish to leave this form without saving first?', () => {
      this.set('credit', null);
    })
  }

  @action
  startCopy(selectedPositionId = 0) {
    this.set('presentYear', currentYear());
    const selectedLaborDay = laborDay(this.year);
    const presentLaborDay = laborDay(this.presentYear);
    this.set('selectedYearLaborDay', selectedLaborDay.format('MMMM Do'));
    this.set('presentYearLaborDay', presentLaborDay.format('MMMM Do'));
    this.set('laborDayDiff', presentLaborDay.diff(selectedLaborDay, 'days'));
    let sourceCredits = this.viewCredits;
    if (selectedPositionId > 0) {
      sourceCredits = sourceCredits.filter((p) => p.position_id == selectedPositionId);
    }

    let copyPositions = [];
    _.forOwn(_.groupBy(sourceCredits, 'position_id'),
      (credits, positionId) => {
        copyPositions.push(CopySourcePosition.create({
          id: positionId,
          title: credits[0].positionTitle,
          controller: this,
          credits: credits.map((c) => CopySourceCredit.create({
            controller: this,
            source: c,
          })),
        }))
      });
    copyPositions = copyPositions.sortBy('title');
    if (copyPositions.length === 1) {
      copyPositions[0].set('expanded', true);
    }
    this.set('copyParams', CopyParams.create({
      deltaDays: this.laborDayDiff,
    }));
    this.set('copySourcePositions', copyPositions);
  }

  @computed('copySourcePositions.@each.selectedCredits')
  get copySelectedCreditCount() {
    return _.sumBy(this.copySourcePositions, (p) => p.selectedCredits.length);
  }

  @action
  cancelCopy() {
    this.set('copySourcePositions', null);
    this.set('copyParams', null);
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
    this.ajax.request(`position-credit/copy`, {
      method: 'POST',
      data: data,
    }).then((result) => {
      if (result.position_credit.length) {
        this.toast.success(`Copied ${result.position_credit.length} credits`);
      } else if (result.message === 'success') {
        this.toast.success('No credits copied');
      } else {
        this.house.handleErrorResponse(result);
      }
      // refresh the list
      this.credits.update()
        .catch((response) => this.house.handleErrorResponse(response))
        .finally(() => {
          this.isCopying = false
          this.set('copySourcePositions', null);
          this.set('copyParams', null);

        });
    }).catch((response) => {
      this.house.handleErrorResponse(response);
      this.isCopying = false;
      this.set('copySourcePositions', null);
      this.set('copyParams', null);
    });
  }

  @action
  copyToggleExpanded(position) {
    position.toggleProperty('expanded');
  }

  @action
  copyPositionSelectAll(position) {
    // if all are selected, deselect all; otherwise select all
    const value = !position.get('allSelected');
    position.get('credits').forEach((c) => c.set('selected', value));
  }
}
