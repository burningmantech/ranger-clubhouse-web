import Controller from '@ember/controller';
import EmberObject from '@ember/object';
import { action, computed } from '@ember-decorators/object';
import { filterBy } from '@ember-decorators/object/computed';
import { validateNumber, validatePresence } from 'ember-changeset-validations/validators';
import validateDateTime from 'clubhouse/validators/datetime';
import moment from 'moment';
import _ from 'lodash';

const allDays = { id: 'all', title: 'All Days'};
const allPositions = {id: 'all', title: 'All Positions'};

class CopyParams extends EmberObject {
  deltaDays = 0;
  deltaHours = 0;
  deltaMinutes = 0;
}

class CopySourcePosition extends EmberObject {
  // create with {controller: this, id: …, title: …, credits: […]}
  expanded = false;

  @computed('credits.@each.selected')
  get allSelected() {
    return this.get('credits').every((c) => c.get('selected'));
  }

  @filterBy('credits', 'selected', true) selectedCredits;
}

class CopySourceCredit extends EmberObject {
  // create with {controller: this, source: creditModel}
  selected = true;

  @computed('source', 'controller.copyParams.{deltaDays,deltaHours,deltaMinutes}')
  get start_time() {
    return this.adjustTime(this.source.start_time);
  }

  @computed('source', 'controller.copyParams.{deltaDays,deltaHours,deltaMinutes}')
  get end_time() {
    return this.adjustTime(this.source.end_time);
  }

  adjustTime(sourceDate) {
    const delta = this.get('controller.copyParams');
    return moment(sourceDate).add({
      days: delta.deltaDays,
      hours: delta.deltaHours,
      minutes: delta.deltaMinutes
    }).format('ddd MMM DD [@] HH:mm YYYY');
  }
}

export default class AdminCreditsController extends Controller {
  queryParams = [ 'year' ];

  dayFilter =  allDays;
  positionFilter =  allPositions;

  creditValidations = {
    start_time: validateDateTime({ presence: true, before: 'end_time'}),
    end_time: validateDateTime({ presence: true, after: 'start_time'}),
    description: validatePresence({ presence: true }),
    position_id: validatePresence({ presence: true }),
    credits_per_hour: validatePresence({ presence: true }),
  };

  copyValidations = {
    deltaDays: validateNumber({ integer: true }),
    deltaHours: validateNumber({ integer: true }),
    deltaMinutes: validateNumber({ integer: true }),
  };

  @computed('credits[]','credits.@each.{position_id,start_time}', 'dayFilter', 'positionFilter')
  get viewCredits() {
    let credits = this.credits;
    const dayFilter = this.dayFilter;
    const positionFilter = this.positionFilter;

    if (positionFilter && positionFilter.id && positionFilter.id != 'all') {
        credits = credits.filterBy('position_id', positionFilter.id);
    }

    if (dayFilter && dayFilter.id) {
      const day = dayFilter.id;

      if (day == 'upcoming') {
        credits = credits.filterBy('has_started', false);
      } else if (day != 'all') {
        credits = credits.filterBy('creditDay', day);
      }
    }

    return credits.sortBy('');
  }

  @computed('credits.@each.start_time')
  get dayOptions() {
    const unique = this.credits.uniqBy('creditDay').mapBy('creditDay');
    const days = [ allDays ];

    unique.forEach((day) => days.pushObject({id: day, title: moment(day).format('ddd MMM DD')}));

    return days;
  }

  @computed('viewCredits', 'dayFilter', 'positionFilter')
  get creditGroups() {
    let credits = this.viewCredits;
    let groups = [];

    credits.forEach(function(credit) {
      const title = credit.position ? credit.positionTitle : `Position #${credit.position_id}`;
      let group = groups.findBy('title', title);

      if (group) {
        group.credits.push(credit);
      } else {
        groups.push({title, position_id: credit.position_id, credits: [ credit ]});
      }
    });

    return groups.sortBy('title');
  }

  @computed('credits.@each.position_id}')
  get filterPositionOptions() {
    const unique = this.credits.uniqBy('positionTitle');

    let options = [];

    unique.forEach(function(credit) {
      options.push({id: credit.position_id, title: credit.positionTitle});
    });

    options = options.sortBy('title');
    options.unshift(allPositions);
    return options;
  }

  @computed('positions')
  get positionOptions() {
    return this.positions.map((p) => [ p.title, p.id ]);
  }

  @action
  newCredit() {
    this.set('credit', this.store.createRecord('position-credit', { position_ids: [] }));
  }

  @action
  editCredit(credit) {
    this.set('credit', credit);
  }

  @action
  async saveCredit(model, isValid) {
    if (!isValid) {
      return;
    }

    const isNew = model.get('isNew');

    this.toast.clear();

    if (isNew) {
      const positionIds = model.get('position_id');
      // Bulk creation - loop through all select position ids
      for (let i = 0; i < positionIds.length; i++) {
        const newCredit = this.store.createRecord('position-credit', {
          position_id: positionIds[i],
          start_time: model.get('start_time'),
          end_time: model.get('end_time'),
          description: model.get('description'),
          credits_per_hour: model.get('credits_per_hour')
        });

        try {
          await newCredit.save();
          this.credits.pushObject(newCredit);
          this.toast.success(`${newCredit.positionTitle} position credit created.`);
        } catch (response) {
          this.house.handleErrorResponse(response);
          break;
        }
      }

      this.set('credit', null);
    } else {
      this.house.saveModel(model, 'The position credit has been successfully updated.', () => {
        this.set('credit', null);
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
            .catch((response) => this.house.handleErrorResponse(response) )
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
  changeYear(year) {
    // Magic! set the year, and the query params fire off.
    this.set('year', year);
  }

  @action
  startCopy() {
    const laborDay = (year) => {
      for (let i = 1; i <= 7; i++) {
        let day = moment([year, 8, i]);
        if (day.day() === 1) { // first Monday of September
          return day;
        }
      }
    };
    this.set('presentYear', moment().year());
    const selectedLaborDay = laborDay(this.get('year'));
    const presentLaborDay = laborDay(this.get('presentYear'));
    this.set('selectedYearLaborDay', selectedLaborDay.format('MMMM Do'));
    this.set('presentYearLaborDay', presentLaborDay.format('MMMM Do'));
    this.set('laborDayDiff', presentLaborDay.diff(selectedLaborDay, 'days'));
    const copyPositions = [];
    _.forOwn(_.groupBy(this.get('viewCredits'), 'position_id'),
      (credits, positionId) => copyPositions.push(CopySourcePosition.create({
        id: positionId,
        title: credits[0].positionTitle,
        controller: this,
        credits: credits.map((c) => CopySourceCredit.create({
          controller: this,
          source: c,
        })),
      })));
    copyPositions.sortBy('title');
    if (copyPositions.length === 1) {
      copyPositions[0].set('expanded', true);
    }
    this.set('copyParams', CopyParams.create({
      deltaDays: this.get('laborDayDiff'),
    }));
    this.set('copySourcePositions', copyPositions);
  }

  @computed('copySourcePositions.@each.selectedCredits')
  get copySelectedCreditCount() {
    return _.sumBy(this.get('copySourcePositions'), (p) => p.get('selectedCredits').length);
  }

  @action
  cancelCopy() {
    this.set('copySourcePositions', null);
    this.set('copyParams', null);
  }

  @action
  performCopy() {
    let params = this.get('copyParams');
    let sourceIds = this.get('copySourcePositions').flatMap((p) => p.get('selectedCredits')).map((c) => c.source.id);
    if (sourceIds.length === 0) {
      this.toast.warning('No credits selected to copy; no changes made');
    } else {
      this.ajax.request(`position-credit/copy`, {
        method: 'POST',
        data: {
          deltaDays: params.deltaDays,
          deltaHours: params.deltaHours,
          deltaMinutes: params.deltaMinutes,
          ids: sourceIds,
        }
      }).then((result) => {
        if (result.message == 'success') {
          this.toast.success(`Copied ${result.length} credits`);
        } else {
          this.house.handleErrorResponse(result);
        }
        this.credits.update(); // refresh the list
      }).catch((response) => {
        this.house.handleErrorResponse(response);
      });
    }
    this.set('copySourcePositions', null);
    this.set('copyParams', null);
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
