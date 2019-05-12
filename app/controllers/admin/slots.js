import Controller from '@ember/controller';
import { set } from '@ember/object';
import { action, computed } from '@ember/object';
import moment from 'moment';

const allDays = { id: 'all', title: 'All' };

const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export default class SlotsController extends Controller {
  queryParams = [ 'year' ];

  dayFilter = 'all';
  positionFilter = 'all';
  activeFilter = 'all';

  activeOptions = [
    { id: 'all', title: 'All' },
    { id: 'active', title: 'Active' },
    { id: 'inactive', title: 'Inactive' },
  ];

  showingGroups = { };

  @computed('slots[]','slots.@each.{position_id,begins}', 'dayFilter', 'activeFilter')
  get viewSlots() {
    let slots = this.slots;
    const dayFilter = this.dayFilter;
    const activeFilter = this.activeFilter;

    if (activeFilter == 'active') {
      slots = slots.filterBy('active', true);
    } else if (activeFilter == 'inactive') {
      slots = slots.filterBy('active', false);
    }

    if (dayFilter) {
      if (dayFilter == 'upcoming') {
        slots = slots.filterBy('has_started', false);
      } else if (dayFilter != 'all') {
        slots = slots.filterBy('slotDay', dayFilter);
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

  @computed('viewSlots.@each.{active,position_id}', 'dayFilter', 'activeFilter')
  get slotGroups() {
    let slots = this.viewSlots;
    let groups = [];

    slots.forEach(function(slot) {
      const title = slot.position_title;
      let group = groups.findBy('title', title);

      if (group) {
        group.slots.push(slot);
      } else {
        group = {
          title,
          position_id: slot.position_id,
          slots: [ slot ],
          inactive: 0
        }
        groups.push(group);
      }

      if (!slot.active) {
        group.inactive++;
      }
    });

    return groups.sortBy('title');
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

  _duplicateSlot(model) {
    return this.store.createRecord('slot', {
      begins: model.get('begins'),
      ends: model.get('ends'),
      description: model.get('description'),
      active: model.get('active'),
      position_id: model.get('position_id'),
      //trainer_slot_id: model.get('trainer_slot_id'),
      max: model.get('max'),
      url: model.get('url')
    });
  }

  @action
  repeatSlot(slot) {
    const duplicate = this._duplicateSlot(slot);

    duplicate.save().then(() => {
      this.slots.pushObject(duplicate);
      duplicate.set('signed_up', 0);
      this.toast.success('Slot was successfully repeated.');
    });
  }

  @action
  repeatSlotAdd24Hours(slot) {
    const duplicate = this._duplicateSlot(slot);

    duplicate.set('begins', moment(slot.begins).add(24, 'hours').format(DATETIME_FORMAT));
    duplicate.set('ends',moment(slot.ends).add(24, 'hours').format(DATETIME_FORMAT));

    duplicate.save().then(() => {
      duplicate.set('signed_up', 0);
      this.slots.pushObject(duplicate);
      this.toast.success('Slot was successfully repeated with 24 hour addition.');
    });
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
  cloneSlot(model, isValid) {
    if (!isValid) {
      return;
    }

    const duplicate = this._duplicateSlot(model);
    duplicate.save().then(() => {
      this.slots.pushObject(duplicate);
      this.toast.success(`Slot successfully created from existing slot.`);
      this.set('slot', duplicate);
    });
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

  @action
  toggleShowing(group) {
    set(this.showingGroups, group.position_id, !this.showingGroups[group.position_id]);
  }
}
