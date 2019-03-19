import Controller from '@ember/controller';
import { computed, action } from '@ember-decorators/object';
import moment from 'moment';

const allDays = { id: 'all', title: 'All Days'};
const allPositions = {id: 'all', title: 'All Positions'};

export default class SlotsController extends Controller {
  queryParams = [ 'year' ];

  dayFilter =  allDays;
  positionFilter =  allPositions;
  activeFilter = 0;

  @computed('slots[]','slots.@each.{position_id,begins}', 'dayFilter', 'positionFilter', 'activeFilter')
  get viewSlots() {
    let slots = this.slots;
    const dayFilter = this.dayFilter;
    const positionFilter = this.positionFilter;
    const activeFilter = this.activeFilter;

    if (activeFilter == 1) {
      slots = slots.filterBy('active', true);
    } else if (activeFilter == 2) {
      slots = slots.filterBy('active', false);
    }

    if (positionFilter && positionFilter.id && positionFilter.id != 'all') {
        slots = slots.filterBy('position_id', positionFilter.id);
    }

    if (dayFilter && dayFilter.id) {
      const day = dayFilter.id;

      if (day == 'upcoming') {
        slots = slots.filterBy('has_started', false);
      } else if (day != 'all') {
        slots = slots.filterBy('slotDay', day);
      }
    }

    return slots.sortBy('begins');
  }

  @computed('slots.{[],@each.begins}')
  get dayOptions() {
    const unique = this.slots.uniqBy('slotDay').mapBy('slotDay');
    const days = [ allDays ];

    unique.sort((a,b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });

    unique.forEach((day) => days.pushObject({id: day, title: moment(day).format('ddd MMM DD')}));

    return days;
  }

  @computed('viewSlots', 'dayFilter', 'positionFilter', 'active')
  get slotGroups() {
    let slots = this.viewSlots;
    let groups = [];

    slots.forEach(function(slot) {
      const title = slot.position_title;
      let group = groups.findBy('title', title);

      if (group) {
        group.slots.push(slot);
      } else {
        groups.push({title, position_id: slot.position_id, slots: [ slot ]});
      }
    });

    return groups.sortBy('title');
  }

  @computed('slots.{[],@each.position_id}')
	get positionOptions() {
    const unique = this.slots.uniqBy('position_title');

    let options = [];

    unique.forEach(function(slot) {
      options.push({id: slot.position_id, title: slot.position_title});
    });

    options = options.sortBy('title');
    options.unshift(allPositions);
    return options;
  }

  @computed('slots.{[],@each.position_id}')
  get trainerSlots() {
    return this.slots.filter((slot) => slot.position_title.match(/(trainer|mentor)/i));
  }

  _updateGroupActive(group, isActive) {
    // TODO: figure out a single api to due bulk updates.
    group.slots.forEach(async (slot) => {
      slot.set('active', isActive);
      await slot.save();
    });

    this.toast.success(`Slots has been ${isActive ? 'activated' : 'deactivated'}`);
  }

  @action
  newSlot() {
    const position_id = this.positions.firstObject.id;
    this.set('slot', this.store.createRecord('slot', { position_id }));
  }

  @action
  editSlot(slot) {
    this.set('slot', slot);
  }

  @action
  saveSlot(model, isValid, originalModel) {
    const isNew = model.get('isNew');

    if (!isValid) {
      return;
    }

    this.house.saveModel(model, `The slot has been ${isNew ? 'created' : 'updated'}.`, () => {
      this.set('slot', null);
      if (isNew) {
        this.slots.pushObject(originalModel);
      }
    })
  }

  @action
  deleteSlot(slot) {
    this.modal.confirm(
      'Confirm Slot Deletion',
      `Are you sure you want to delete ${slot.position_title} - ${slot.description}?`,
      () => {
        slot.destroyRecord()
            .then(() => {
              this.slots.removeObject(slot);
              this.toast.success('Slot has been deleted.')
            })
            .catch((response) => this.house.handleErrorResponse(response) )
      }
    );
  }

  @action
  activate(group) {
    this._updateGroupActive(group, true);
  }

  @action
  deactivate(group) {
    this._updateGroupActive(group, false);
  }

  @action
  cancel(model) {
    if (!model.get('isDirty')) {
      this.set('slot', null);
      return;
    }

    this.modal.confirm('Unsaved Changes', 'The changes have not been saved. Are you sure you wish to leave this form without saving first?', () => {
      this.set('slot', null);
    })
  }

  @action
  changeYear(year) {
    // Magic! set the year, and the query params fire off.
    this.set('year', year);
  }
}
