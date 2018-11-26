import Controller from '@ember/controller';
import { action, computed } from '@ember-decorators/object';
import { validatePresence } from 'ember-changeset-validations/validators';
import validateDateTime from 'clubhouse/validators/datetime';
import moment from 'moment';

const allDays = { id: 'all', title: 'All Days'};
const allPositions = {id: 'all', title: 'All Positions'};

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
}
