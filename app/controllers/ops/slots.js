import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import dayjs from 'dayjs';
import _, {filter, isEmpty} from 'lodash';
import {cached, tracked} from '@glimmer/tracking';
import {debounce} from '@ember/runloop';

const allDays = {id: 'all', title: 'All'};
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export default class OpsSlotsController extends ClubhouseController {
  queryParams = ['year'];

  @tracked dayFilter = 'all';
  @tracked activeFilter = 'all';

  activeOptions = [
    {id: 'all', title: 'All'},
    {id: 'active', title: 'Active'},
    {id: 'inactive', title: 'Inactive'},
  ];

  @tracked activatingSlot = null;

  @tracked slot = null; // Editing slot

  @tracked filterByDescription;

  @tracked positionsOpened = {};

  @tracked presentYear;
  @tracked selectedYearLaborDay;
  @tracked presentYearLaborDay;
  @tracked laborDayDiff;

  @tracked showBulkEditDialog = false;
  @tracked showSlotCopyDialog = false;
  @tracked selectedPositionId = null;

  @tracked bulkEditPosition;

  @tracked linkGroup;
  @tracked linkType;

  @tracked bulkEditFiltered = false;

  @action
  changeActiveFilter(value) {
    this.activeFilter = value;
  }

  @action
  changeDayFilter(value) {
    this.dayFilter = value;
  }

  @action
  toggleBulkEditFiltered() {
    this.bulkEditFiltered = !this.bulkEditFiltered;
  }

  @action
  changeFilterByDescription(event) {
    debounce(this, this.setFilterByDescription, event.target.value, 350);
  }

  @action
  clearFilterByDescription() {
    this.filterByDescription = '';
  }

  @action
  setFilterByDescription(value) {
    this.filterByDescription = value;
  }

  @cached
  get viewSlots() {
    let slots = this.slots;
    const dayFilter = this.dayFilter;
    const activeFilter = this.activeFilter;
    let filterByDescription = this.filterByDescription

    if (activeFilter === 'active') {
      slots = slots.filter((s) => s.active);
    } else if (activeFilter === 'inactive') {
      slots = slots.filter((s) => !s.active);
    }

    if (dayFilter) {
      if (dayFilter === 'upcoming') {
        slots = slots.filter((s) => s.has_started);
      } else if (dayFilter !== 'all') {
        slots = slots.filter((s) => s.slotDay === dayFilter);
      }
    }

    if (!isEmpty(filterByDescription)) {
      filterByDescription = filterByDescription.toLowerCase();
      slots = filter(slots, (slot) => slot.description.toLowerCase().indexOf(filterByDescription) !== -1);
    }

    return _.sortBy(slots, 'begins');
  }

  @cached
  get dayOptions() {
    const unique = _.map(_.uniqBy(this.slots, 'slotDay'), 'slotDay');
    const days = [allDays];

    unique.sort((a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });

    unique.forEach((day) => days.push({id: day, title: dayjs(day).format('ddd MMM DD')}));

    return days;
  }

  @cached
  get positionSlots() {
    const groups = [];

    this.viewSlots.forEach((slot) => {
      const position = this.positionsById[slot.position_id];
      let group = groups.find((g) => slot.position_id === +g.position.id);

      if (group) {
        group.slots.push(slot);
      } else {
        group = {
          position,
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

    return _.sortBy(groups, (g) => g.position.title);
  }

  @cached
  get filteredDescriptionGroup() {
    const group = {
      position: null,
      slots: this.viewSlots,
      inactive: 0,
    };

    this.viewSlots.forEach((slot) => {
      if (!slot.active) {
        group.inactive++;
      }
    });

    return group;
  }

  @cached
  get positionsScrollList() {
    return this.positionSlots.map((p) => ({id: `position-${p.position.id}`, title: p.position.title}));
  }

  @action
  positionClicked(position, opened) {
    this.positionsOpened[position.id] = opened;
  }

  @action
  keepAccordionOpen(position) {
    return this.positionsOpened[position.id];
  }

  @cached
  get trainerSlots() {
    return this.slots.filter((slot) => slot.position_title.match(/(trainer|mentor)/i));
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
    await this._updateSlots();
    this.toast.success(`Slots has been ${isActive ? 'activated' : 'deactivated'}`);
  }

  @action
  newSlot() {
    if (this.year !== this.house.currentYear()) {
      this.modal.confirm('Not Current Year',
        `You are able to create a slot for a prior year (${this.year}). Are you sure you want to do this? `,
        () => this._setupNewSlot()
      );
    } else {
      this._setupNewSlot();
    }
  }

  _setupNewSlot() {
    this.slot = this.store.createRecord('slot', {position_id: this.positions[0].id});
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

    this.house.saveModel(model, `The slot has been ${isNew ? 'created' : 'updated'}.`,
      () => {
        this.slot = null;
        this._updateSlots();
      })
  }

  @action
  async _updateSlots() {
    try {
      await this.slots.update();
    } catch (response) {
      this.house.handleErrorResponse(response);
    }
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
      timezone: model.timezone,
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
  async repeatSlotAdd24Hours(slot) {
    const duplicate = this._duplicateSlot(slot);

    duplicate.begins = dayjs(slot.begins).add(24, 'hours').format(DATETIME_FORMAT);
    duplicate.ends = dayjs(slot.ends).add(24, 'hours').format(DATETIME_FORMAT);

    try {
      await duplicate.save();
      this._updateSlots();
      this.toast.success('Slot was successfully repeated with 24 hour addition.');
    } catch (response) {
      this.house.handleErrorResponse(response)
    }
  }

  @action
  deleteSlot(slot) {
    this.modal.confirm(
      'Confirm Slot Deletion',
      `Are you sure you want to delete ${slot.position_title} - ${slot.description}?`,
      async () => {
        try {
          await slot.destroyRecord();
          this.toast.success('Slot has been deleted.');
        } catch (response) {
          this.house.handleErrorResponse(response)
        }
      });
  }

  @action
  async cloneSlot(model, isValid) {
    if (!isValid) {
      return;
    }

    const duplicate = this._duplicateSlot(model);
    try {
      await duplicate.save();
      this._updateSlots();
      this.toast.success(`Slot successfully created from existing slot.`);
      this.slot = duplicate;
    } catch (response) {
      this.house.handleErrorResponse(response)
    }
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
  openSlotCopy(positionId) {
    if (this.year === this.house.currentYear()) {
      this.modal.confirm('Current Year',
        `You are about to copy slots from the current year (${this.year}) instead of a prior year. Are you sure you want to do this?`,
        () => {
          this.selectedPositionId = positionId;
          this.showSlotCopyDialog = true;
        }
      )
    } else {
      this.selectedPositionId = positionId;
      this.showSlotCopyDialog = true;
    }
  }

  @action
  cancelSlotCopy() {
    this.showSlotCopyDialog = false;
  }

  @action
  bulkEditOpenAction(position) {
    console.log("position", position);
    this.bulkEditPosition = position;
    this.showBulkEditDialog = true;
  }

  @action
  bulkEditCloseAction() {
    this.showBulkEditDialog = false;
  }

  @action
  bulkEditPositionUpdatedAction() {
    //this._buildPositionSlots();
    this.showBulkEditDialog = false;
  }

  @action
  openLinkSlots(group, type) {
    this.linkGroup = group;
    this.linkType = type;
  }

  @action
  async closeLinkSlots(didUpdate) {
    this.linkGroup = null;
    this.linkType = null;
    if (didUpdate) {
      try {
        await this.slots.update();
      } catch (e) {
        this.house.handleErrorResponse(e);
      }
    }
  }
}
