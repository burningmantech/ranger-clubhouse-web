import Component from '@glimmer/component';
import {validatePresence, validateNumber} from 'ember-changeset-validations/validators';
import validateDateTime from 'clubhouse/validators/datetime';
import TimezoneOptions from 'clubhouse/constants/timezone-options';
import dayjs from 'dayjs';
import {MONTH_DAY_TIME} from 'clubhouse/helpers/shift-format';
import {action} from '@ember/object';

export default class SlotFormComponent extends Component {
  timezoneOptions = TimezoneOptions;

  slotValidations = {
    description: [validatePresence({presence: true, message: 'Enter a description.'}),],

    begins: [validatePresence({presence: true, message: 'Enter a date and time.'}), validateDateTime({
      before: 'ends',
      beforeName: 'Ending Time'
    })],

    ends: [validatePresence({presence: true, message: 'Enter a date and time.'}), validateDateTime({
      after: 'begins',
      afterName: 'Beginning Time'
    })],

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
  hasParentPosition(positionId) {
    if (!positionId) {
      return false;
    }

    return !!this.args.positions.find((p) => +p.id === +positionId && p.parent_position_id);
  }

  @action
  slotOptions(positionId) {
    const {slots, positions} = this.args;

    const options = [];


    if (!positionId) {
      return options;
    }

    const position = positions.find((p) => +p.id === +positionId);

    if (!position.parent_position_id) {
      return options;
    }

    const parentId = +position.parent_position_id;

    slots.filter((s) => s.position_id === parentId).forEach((s) =>
      options.push([`${s.position.title} - ${s.description} - ${dayjs(s.begins).format(MONTH_DAY_TIME)}`, s.id])
    );

    return options;
  }
}

