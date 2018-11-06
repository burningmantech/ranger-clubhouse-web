import Component from '@ember/component';
import SlotValidations from 'clubhouse/validations/slot';
import { computed, action } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';

export default class SlotFormComponent extends Component {
  slotValidations = SlotValidations;

  // Slot to edit or create
  @argument slot;

  // Positions to select from for assignment
  @argument positions;

  // Training slots to select form
  @argument trainerSlots;

  // save action
  @argument onSave;
  // cancel action
  @argument onCancel;

  @computed('positions')
  get positionOptions() {
    return this.positions.map((p) => [ p.title, p.id ]);
  }

  @computed('slot')
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

    groupOptions = groupOptions.sortBy('groupName');
    groupOptions.unshift('');
    return groupOptions;
  }

  @action
  save(model, isValid, originalModel) {
    this.onSave(model, isValid, originalModel);
  }

  @action
  cancel(model) {
        this.onCancel(model);
  }
}
