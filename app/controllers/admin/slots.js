import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action, set} from '@ember/object';
import currentYear from 'clubhouse/utils/current-year';
import laborDay from 'clubhouse/utils/labor-day';
import dayjs from 'dayjs';
import _ from 'lodash';
import {tracked} from '@glimmer/tracking';

const allDays = {id: 'all', title: 'All'};
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

class CopyParams {
  @tracked deltaDays = 0;
  @tracked deltaHours = 0;
  @tracked deltaMinutes = 0;
  @tracked newPositionId = 0;
  @tracked activate = false;

  // Attributes:
  @tracked description = null;
  @tracked max = null;
  @tracked url = null;

  constructor(obj) {
    Object.assign(this, obj);
  }
}

class CopySourcePosition {
  @tracked slots;

  constructor(obj) {
    Object.assign(this, obj);
  }

  get allSelected() {
    return this.slots.every((c) => c.selected);
  }

  get selectedSlots() {
    return this.slots.filter((s) => s.selected);
  }
}

class CopySourceSlot {
  // create with {controller: this, source: slot}
  @tracked selected = false;
  @tracked controller;
  @tracked source;

  constructor(obj) {
    Object.assign(this, obj);
  }

  get begins() {
    return this.adjustTime(this.source.begins);
  }

  get ends() {
    return this.adjustTime(this.source.ends);
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

export default class SlotsController extends ClubhouseController {
  queryParams = ['year'];

  @tracked dayFilter = 'all';
  @tracked activeFilter = 'all';

  activeOptions = [
    {id: 'all', title: 'All'},
    {id: 'active', title: 'Active'},
    {id: 'inactive', title: 'Inactive'},
  ];

  @tracked isCopyingSlots = false;
  @tracked activatingSlot = null;

  @tracked slot = null; // Editing slot

  @tracked positionsOpened = {};
  @tracked positionSlots = [];
  @tracked viewSlots = [];

  @tracked presentYear;
  @tracked selectedYearLaborDay;
  @tracked presentYearLaborDay;
  @tracked laborDayDiff;
  @tracked copyParams;
  @tracked copySourcePositions;

  @tracked showBulkEditDialog = false;
  @tracked bulkEditPosition;

  @action
  changeActiveFilter(value) {
    this.activeFilter = value;
    this._buildDisplay();
  }

  @action
  changeDayFilter(value) {
    this.dayFilter = value;
    this._buildDisplay();
  }

  _buildDisplay() {
    this._buildViewSlots();
    this._buildPositionSlots();
  }

  _buildViewSlots() {
    let slots = this.slots;
    const dayFilter = this.dayFilter;
    const activeFilter = this.activeFilter;

    if (activeFilter === 'active') {
      slots = slots.filterBy('active', true);
    } else if (activeFilter === 'inactive') {
      slots = slots.filterBy('active', false);
    }

    if (dayFilter) {
      if (dayFilter === 'upcoming') {
        slots = slots.filterBy('has_started', false);
      } else if (dayFilter !== 'all') {
        slots = slots.filterBy('slotDay', dayFilter);
      }
    }

    this.viewSlots = slots.sortBy('begins');
  }

  get dayOptions() {
    const unique = this.slots.uniqBy('slotDay').mapBy('slotDay');
    const days = [allDays];

    unique.sort((a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });

    unique.forEach((day) => days.pushObject({id: day, title: dayjs(day).format('ddd MMM DD')}));

    return days;
  }

  _buildPositionSlots() {
    const groups = [];

    this.viewSlots.forEach(function (slot) {
      const title = slot.position_title;
      let group = groups.findBy('title', title);

      if (group) {
        group.slots.push(slot);
      } else {
        group = {
          title,
          position_id: slot.position_id,
          slots: [slot],
          inactive: 0,
          showing: false
        }
        groups.push(group);
      }

      if (!slot.active) {
        group.inactive++;
      }
    });

    this.positionSlots = groups.sortBy('title');
  }

  @action
  positionClicked(position, opened) {
    this.positionsOpened[position.position_id] = opened;
  }

  get trainerSlots() {
    return this.slots.filter((slot) => slot.position_title.match(/(trainer|mentor)/i));
  }

  get positionOptionsForCopy() {
    const options = this.positions.map((p) => [p.title, p.id]);
    return [['(same position)', 0], ...options];
  }

  async _updateGroupActive(group, isActive) {
    const slots = group.slots;

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      if (slot.active === isActive) {
        // no update needed.
        continue;
      }
      slot.active = isActive;
      this.activatingSlot = slot;
      try {
        await slot.save();
      } catch (response) {
        this.house.handleErrorResponse(response);
      }
    }
    this.activatingSlot = null;
    this._updateSlots();
    this.toast.success(`Slots has been ${isActive ? 'activated' : 'deactivated'}`);
  }

  @action
  newSlot() {
    const position_id = this.positions.firstObject.id;
    this.slot = this.store.createRecord('slot', {position_id});
  }

  @action
  editSlot(slot) {
    this.slot = slot;
  }

  @action
  saveSlot(model, isValid) {
    const isNew = model.isNew;

    if (!isValid) {
      return;
    }

    this.house.saveModel(model, `The slot has been ${isNew ? 'created' : 'updated'}.`, () => {
      this.slot = null;
      this._updateSlots();
    })
  }

  _updateSlots() {
    return this.slots.update().then(() => {
      this._buildDisplay();
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
      this._updateSlots();
      this.toast.success('Slot was successfully repeated.');
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  repeatSlotAdd24Hours(slot) {
    const duplicate = this._duplicateSlot(slot);

    duplicate.begins = dayjs(slot.begins).add(24, 'hours').format(DATETIME_FORMAT);
    duplicate.ends = dayjs(slot.ends).add(24, 'hours').format(DATETIME_FORMAT);

    duplicate.save().then(() => {
      this._updateSlots();
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
            this._buildDisplay();
            this.toast.success('Slot has been deleted.')
          })
          .catch((response) => this.house.handleErrorResponse(response))
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
      this._updateSlots();
      this.toast.success(`Slot successfully created from existing slot.`);
      this.slot = duplicate;
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
  cancel() {
      this.slot = null;
  }

  @action
  startCopy(selectedPositionId = null) {
    this.presentYear = currentYear();
    const selectedLaborDay = laborDay(this.year);
    const presentLaborDay = laborDay(this.presentYear);
    this.selectedYearLaborDay = selectedLaborDay.format('MMMM Do');
    this.presentYearLaborDay = presentLaborDay.format('MMMM Do');
    this.laborDayDiff = presentLaborDay.diff(selectedLaborDay, 'days');
    let copyPositions = [];
    let canCopy = (s) => !s.training_id && !s.trainee_slot_id && !s.trainer_slot_id;
    let slotsByPosition = _.groupBy(this.viewSlots.filter(canCopy), 'position_id');
    if (selectedPositionId) {
      slotsByPosition = _.pick(slotsByPosition, [selectedPositionId]);
    }
    _.forOwn(
      slotsByPosition,
      (slots, positionId) => copyPositions.push(new CopySourcePosition({
        id: positionId,
        title: slots[0].position_title,
        controller: this,
        slots: slots.map((s) => new CopySourceSlot({controller: this, source: s}))
      }))
    );
    copyPositions = copyPositions.sortBy('title');
    this.copyParams = new CopyParams({deltaDays: this.laborDayDiff});
    this.copySourcePositions = copyPositions;
  }

  get copySelectedSlotCount() {
    return _.sumBy(this.copySourcePositions, (p) => p.selectedSlots.length);
  }

  @action
  cancelCopy() {
    this.copySourcePositions = null;
    this.copyParams = null;
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
      return;
    }
    const data = {
      ids: sourceIds,
      activate: params.activate,
      attributes: {},
    };
    ['deltaDays', 'deltaHours', 'deltaMinutes', 'newPositionId'].forEach(function (key) {
      if (params[key] != 0) {
        data[key] = params[key];
      }
    });
    ['description', 'url', 'max'].forEach(function (key) {
      if (params[key]) {
        data.attributes[key] = params[key];
      }
    });

    this.isCopyingSlots = true;
    this.ajax.request(`slot/copy`, {method: 'POST', data: data})
      .then((result) => {
        if (!result.slot.length) {
          this.toast.error('No slots copied');
          return;
        }

        this.toast.success(`Copied ${result.slot.length} slots`);

        return this._updateSlots().then(() => {
          this.copySourcePositions = null;
          this.copyParams = null;
        })
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isCopyingSlots = false);
  }

  @action
  copyPositionSelectAll(position, event) {
    event.stopPropagation();
    // if all are selected, deselect all; otherwise select all
    const value = !position.allSelected;
    position.slots.forEach((s) => set(s, 'selected', value));
  }

  @action
  bulkEditOpenAction(position) {
    this.bulkEditPosition = position;
    this.showBulkEditDialog = true;
  }

  @action
  bulkEditCloseAction(){
    this.showBulkEditDialog = false;
  }

  @action
  bulkEditPositionUpdatedAction() {
    this._buildPositionSlots();
    this.showBulkEditDialog = false;
  }
}
