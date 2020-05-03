import Component from '@ember/component';
import SlotValidations from 'clubhouse/validations/slot';
import { action, computed } from '@ember/object';


export default class SlotFormComponent extends Component {
  slotValidations = SlotValidations;

  // Slot to edit or create
  slot = null;

  // Positions to select from for assignment
  positions = null;

  // Training slots to select form
  trainerSlots = null;

  // save action
  onSave = null;
  // cancel action
  onCancel = null;

  onClone = null;

  @computed('positions')
  get positionOptions() {
    return this.positions.map((p) => [ p.title, p.id ]);
  }

  @computed('slot.{description,id,isNew,position_title}')
  get formTitle() {
      return this.slot.isNew ? 'Create Slot' : `Edit Slot #${this.slot.id} ${this.slot.position_title} - ${this.slot.description}`;
  }

  @computed('trainerSlots')
  get trainerSlotsOptions() {
    const slots = this.trainerSlots;

    let groupOptions = [];

    slots.forEach((slot) => {
      const title = slot.position_title;

      let group = groupOptions.find((opt) => { return title == opt.groupName });

      if (!group) {
        group = { groupName: title, options: [ ] };
        groupOptions.push(group);
      }

      group.options.push([ `${slot.description} ${slot.begins_format}`, slot.id ]);
    });

    return groupOptions.sortBy('groupName');
  }

  @action
  save(model, isValid, originalModel) {
    this.onSave(model, isValid, originalModel);
  }

  @action
  cloneRecord(model, isValid, originalModel) {
    this.onClone(model, isValid, originalModel);
  }


  @action
  cancel(model) {
    this.onCancel(model);
  }
}
