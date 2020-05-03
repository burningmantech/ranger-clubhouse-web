import Controller from '@ember/controller';
import EmberObject from '@ember/object';
import { action, computed, set } from '@ember/object';
import { filterBy } from '@ember/object/computed';
import currentYear from 'clubhouse/utils/current-year';
import laborDay from 'clubhouse/utils/labor-day';
import moment from 'moment';
import _ from 'lodash';

const allDays = { id: 'all', title: 'All' };

const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

class CopyParams extends EmberObject {
  deltaDays = 0;
  deltaHours = 0;
  deltaMinutes = 0;
  newPositionId = 0;
  activate = false;
  // Attributes:
  description = null;
  max = null;
  url = null;
}

class CopySourcePosition extends EmberObject {
  // create with {controller: this, id: â¦, title: â¦, slots: [â¦]}
  expanded = false;

  @computed('slots.@each.selected')
  get allSelected() {
    return this.slots.every((c) => c.selected);
  }

  @filterBy('slots', 'selected', true) selectedSlots;
}

class CopySourceSlot extends EmberObject {
  // create with {controller: this, source: slot}
  selected = false;

  @computed('controller.copyParams.{deltaDays,deltaHours,deltaMinutes}', 'source.begins')
  get begins() {
    return this.adjustTime(this.source.begins);
  }

  @computed('controller.copyParams.{deltaDays,deltaHours,deltaMinutes}', 'source.ends')
  get ends() {
    return this.adjustTime(this.source.ends);
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
          inactive: 0,
          showing: false
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

  @computed('positions')
  get positionOptionsForCopy() {
    const options = this.positions.map((p) => [p.title, p.id]);
    return [['(same position)', 0], ...options];
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
  saveSlot(model, isValid) {
    const isNew = model.isNew;

    if (!isValid) {
      return;
    }

    this.house.saveModel(model, `The slot has been ${isNew ? 'created' : 'updated'}.`, () => {
      this.set('slot', null);
      this.slots.update();
    })
  }

  _duplicateSlot(model) {
    return this.store.createRecord('slot', {
      begins: model.begins,
      ends: model.ends,
      description: model.description,
      active: model.active,
      position_id: model.position_id,
      //trainer_slot_id: model.trainer_slot_id,
      max: model.max,
      url: model.url,

    });
  }

  @action
  repeatSlot(slot) {
    const duplicate = this._duplicateSlot(slot);

    duplicate.save().then(() => {
      this.slots.update();
      this.toast.success('Slot was successfully repeated.');
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  repeatSlotAdd24Hours(slot) {
    const duplicate = this._duplicateSlot(slot);

    duplicate.set('begins', moment(slot.begins).add(24, 'hours').format(DATETIME_FORMAT));
    duplicate.set('ends',moment(slot.ends).add(24, 'hours').format(DATETIME_FORMAT));

    duplicate.save().then(() => {
      this.slots.update();
      this.toast.success('Slot was successfully repeated with 24 hour addition.');
    }).catch((response) => this.house.handleErrorResponse(response));
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
      this.slots.update();
      this.toast.success(`Slot successfully created from existing slot.`);
      this.set('slot', duplicate);
    }).catch((response) => this.house.handleErrorResponse(response));
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
    if (!model.isDirty) {
      this.set('slot', null);
      return;
    }

    this.modal.confirm('Unsaved Changes', 'The changes have not been saved. Are you sure you wish to leave this form without saving first?', () => {
      this.set('slot', null);
    })
  }

  @action
  toggleShowing(group, event) {
    event.preventDefault();
    set(group, 'showing', !group.showing);
  }

  @action
  startCopy(selectedPositionId = null) {
    this.set('presentYear', currentYear());
    const selectedLaborDay = laborDay(this.year);
    const presentLaborDay = laborDay(this.presentYear);
    this.set('selectedYearLaborDay', selectedLaborDay.format('MMMM Do'));
    this.set('presentYearLaborDay', presentLaborDay.format('MMMM Do'));
    this.set('laborDayDiff', presentLaborDay.diff(selectedLaborDay, 'days'));
    let copyPositions = [];
    let canCopy = (s) => !s.training_id && !s.trainee_slot_id && !s.trainer_slot_id;
    let slotsByPosition = _.groupBy(this.viewSlots.filter(canCopy), 'position_id');
    if (selectedPositionId) {
      slotsByPosition = _.pick(slotsByPosition, [selectedPositionId]);
    }
    _.forOwn(
      slotsByPosition,
      (slots, positionId) => copyPositions.push(CopySourcePosition.create({
        id: positionId,
        title: slots[0].position_title,
        controller: this,
        slots: slots.map((s) => CopySourceSlot.create({
          controller: this,
          source: s,
        })),
      }))
    );
    copyPositions = copyPositions.sortBy('title');
    if (copyPositions.length === 1) {
      copyPositions[0].set('expanded', true);
    }
    this.set('copyParams', CopyParams.create({
      deltaDays: this.laborDayDiff,
    }));
    this.set('copySourcePositions', copyPositions);
  }

  @computed('copySourcePositions.@each.selectedSlots')
  get copySelectedSlotCount() {
    return _.sumBy(this.copySourcePositions, (p) => p.selectedSlots.length);
  }

  @action
  cancelCopy() {
    this.set('copySourcePositions', null);
    this.set('copyParams', null);
  }

  @action
  performCopy() {
    const params = this.copyParams;
    if (params.newPositionId > 0) {
      if (this.copySourcePositions.filter((p) => p.selectedSlots.length > 0).length > 1) {
        this.toast.warning("Can't copy slots from multiple positions to a new position");
        return false;
      }
    }
    const sourceIds = this.copySourcePositions.flatMap((p) => p.selectedSlots).map((s) => s.source.id);
    if (sourceIds.length === 0) {
      this.toast.warning('No slots selected to copy; no changes made');
    } else {
      const data = {
        ids: sourceIds,
        activate: params.activate,
        attributes: {},
      };
      ['deltaDays', 'deltaHours', 'deltaMinutes', 'newPositionId'].forEach(function(key) {
        if (params[key] != 0) {
          data[key] = params[key];
        }
      });
      ['description', 'url', 'max'].forEach(function(key) {
        if (params[key]) {
          data.attributes[key] = params[key];
        }
      });
      this.ajax.request(`slot/copy`, {method: 'POST', data: data}).then((result) => {
        if (result.slot.length) {
          this.toast.success(`Copied ${result.slot.length} slots`);
        } else if (result.message === 'success') {
          this.toast.success('No slots copied');
        } else {
          this.house.handleErrorResponse(result);
        }
        this.slots.update(); // refresh the list
      }).catch((response) => {
        this.house.handleErrorResponse(response);
      });
    }
    this.set('copySourcePositions', null);
    this.set('copyParams', null);
    return true;
  }

  @action
  copyToggleExpanded(position) {
    position.toggleProperty('expanded');
  }

  @action
  copyPositionSelectAll(position) {
    // if all are selected, deselect all; otherwise select all
    const value = !position.allSelected;
    position.slots.forEach((s) => s.set('selected', value));
  }
}
