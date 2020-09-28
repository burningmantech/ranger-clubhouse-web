import Component from '@glimmer/component';
import {validatePresence, validateNumber} from 'ember-changeset-validations/validators';
import validateDateTime from 'clubhouse/validators/datetime';

export default class SlotFormComponent extends Component {
  slotValidations = {
    description: [
      validatePresence({presence: true, message: 'Enter a description.'}),
    ],

    begins: [
      validatePresence({presence: true, message: 'Enter a date and time.'}),
      validateDateTime({before: 'ends'})
    ],

    ends: [
      validatePresence({presence: true, message: 'Enter a date and time.'}),
      validateDateTime({after: 'begins'})
    ],

    position_id: [
      validatePresence({presence: true, message: 'Select a position.'}),
    ],

    max: [
      validateNumber({integer: true, message: 'Enter a number'}),
    ],

  };

  get positionOptions() {
    let activePositions = this.args.positions.filter(p => p.active).map(p => [p.title, p.id]);
    let inactivePositions = this.args.positions.filter(p => !p.active).map(p => [p.title, p.id]);

    return [
      { groupName: 'Active', options: activePositions },
      { groupName: 'Inactive', options: inactivePositions },
    ];
  }

  get formTitle() {
    const slot = this.args.slot;
    return slot.isNew ? 'Create Slot' : `Edit Slot #${slot.id} ${slot.position_title} - ${slot.description}`;
  }

  get trainerSlotsOptions() {
    const slots = this.args.trainerSlots;
    const groupOptions = [];

    if (!slots || slots.length == 0) {
      return [];
    }

    slots.forEach((slot) => {
      const title = slot.position_title;

      let group = groupOptions.find((opt) => {
        return title == opt.groupName
      });

      if (!group) {
        group = {groupName: title, options: []};
        groupOptions.push(group);
      }

      group.options.push([`${slot.description} ${slot.begins_format}`, slot.id]);
    });

    return groupOptions.sortBy('groupName');
  }
}

