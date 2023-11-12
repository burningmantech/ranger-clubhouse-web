import Component from '@glimmer/component';
import {validatePresence, validateNumber} from 'ember-changeset-validations/validators';
import validateDateTime from 'clubhouse/validators/datetime';
import TimezoneOptions from 'clubhouse/constants/timezone-options';
import _ from 'lodash';
import dayjs from 'dayjs';
import {MONTH_DAY_TIME} from 'clubhouse/helpers/shift-format';
import {action} from '@ember/object';

export default class SlotFormComponent extends Component {
  timezoneOptions = TimezoneOptions;

  slotValidations = {
    description: [validatePresence({presence: true, message: 'Enter a description.'}),],

    begins: [validatePresence({presence: true, message: 'Enter a date and time.'}), validateDateTime({before: 'ends'})],

    ends: [validatePresence({presence: true, message: 'Enter a date and time.'}), validateDateTime({after: 'begins'})],

    position_id: [validatePresence({presence: true, message: 'Select a position.'}),],

    max: [validateNumber({integer: true, message: 'Enter a number'}),],

  };

  get positionOptions() {
    let activePositions = this.args.positions.filter(p => p.active).map(p => [p.title, p.id]);
    let inactivePositions = this.args.positions.filter(p => !p.active).map(p => [p.title, p.id]);

    return [{groupName: 'Active', options: activePositions}, {groupName: 'Inactive', options: inactivePositions},];
  }

  get formTitle() {
    const slot = this.args.slot;
    return slot.isNew ? 'Create Slot' : `Edit Slot #${slot.id} ${slot.position_title} - ${slot.description}`;
  }

  @action
  parentSlotOptions(positionId) {
    const {slots, positions} = this.args;

    if (!positionId) {
      return [];
    }

    const title = positions.find((p) => +p.id === +positionId).title;
    const matches = title.match(/^(.*)\s+mentor$/i);
    if (!matches) {
      return [];
    }
    const parentTitle = matches[1];

    const parentPosition = positions.find((p) => p.title === parentTitle);
    if (!parentPosition) {
      return [];
    }

    const parentId = +parentPosition.id;

    const parentSlots = slots.filter((s) => s.position_id === parentId).map((s) => {
      return [`${s.position.title} - ${dayjs(s.begins).format(MONTH_DAY_TIME)}`, s.id]
    });

    return [{
      groupName: parentTitle,
      options: parentSlots
    }];
  }

  get trainerSlotsOptions() {
    const slots = this.args.trainerSlots;
    const groupOptions = [];

    if (!slots || !slots.length) {
      return [];
    }

    slots.forEach((slot) => {
      const title = slot.position_title;

      let group = groupOptions.find((opt) => title === opt.groupName);

      if (!group) {
        group = {groupName: title, options: []};
        groupOptions.push(group);
      }

      group.options.push([`${slot.description} ${slot.begins_format}`, slot.id]);
    });

    return _.sortBy(groupOptions, 'groupName');
  }
}

