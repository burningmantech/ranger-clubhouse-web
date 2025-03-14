import Component from '@glimmer/component';
import {validateNumber} from 'ember-changeset-validations/validators';
import {action, set} from '@ember/object';
import {service} from '@ember/service';
import {tracked} from '@glimmer/tracking';
import {isEmpty} from '@ember/utils';

export default class AdminSlotBulkEditComponent extends Component {
  @service house;
  @service modal;
  @service toast;
  @tracked slotUpdating = null;
  @tracked isUpdating = false;
  @tracked selectAll = true;

  bulkEditValidations = {
    max: [
      validateNumber({integer: true, message: 'Enter a number'}),
    ]
  };

  constructor() {
    super(...arguments);
    const {positions, slots} = this.args;

    this.editForm = {
      positionId: null,
      max: '',
      description: '',
    };

    slots.forEach((slot) => {
      this.editForm[`slot_${slot.id}`] = true;
    });

    if (positions) {
      this.positionOptions = positions.map((position) => ({id: position.id, title: position.title}));
      this.positionOptions.unshift({id: null, title: 'Select position to update'});
    }
  }

  @action
  async submitAction() {
    const columns = {};
    const form = this.editForm;
    const {slots} = this.args;

    if (this.args.positions && form.positionId) {
      columns.position_id = form.positionId;
    }

    if (form.max) {
      columns.max = +form.max;
    }

    if (!isEmpty(form.description)) {
      columns.description = form.description;
    }

    if (!isEmpty(form.url)) {
      columns.url = form.url;
    }

    let errors = 0, slotCount = 0;

    this.isUpdating = true;

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];

      if (!form[`slot_${slot.id}`]) {
        continue;
      }

      slotCount++;
      this.slotUpdating = slot;
      Object.assign(slot, columns);
      try {
        await slot.save();
      } catch (response) {
        this.house.handleErrorResponse(response);
        errors++;
      } finally {
        this.slotUpdating = null;
      }
    }

    this.isUpdating = false;


    if (errors) {
      this.toast.error(`${errors} error(s) were encountered`);
      return;
    }

    this.toast.success(`${slotCount} slot(s) were successfully updated.`);
    const {onPositionUpdate} = this.args;
    if (columns.position_id && onPositionUpdate) {
      onPositionUpdate();
    }
    this.args.onClose?.();
  }

  @action
  toggleAll() {
    this.selectAll = !this.selectAll;
    this.args.slots.forEach((slot) => set(this.editForm, `slot_${slot.id}`, this.selectAll));
  }
}
