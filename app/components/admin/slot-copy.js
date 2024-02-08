import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {service} from '@ember/service';
import currentYear from "clubhouse/utils/current-year";
import laborDay from "clubhouse/utils/labor-day";
import _ from "lodash";
import dayjs from 'dayjs';

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

export default class AdminSlotCopyComponent extends Component {
  @service ajax;
  @service house;
  @service toast;

  @tracked copyParams;
  @tracked copySourcePositions;

  @tracked isSubmitting = false;
  @tracked presentYear;
  @tracked selectedYearLaborDay;
  @tracked presentYearLaborDay;
  @tracked laborDayDiff;

  constructor() {
    super(...arguments);

    const {selectedPositionId, viewSlots, year} = this.args;
    this.presentYear = currentYear();
    const selectedLaborDay = laborDay(year);
    const presentLaborDay = laborDay(this.presentYear);
    this.selectedYearLaborDay = selectedLaborDay.format('MMMM Do');
    this.presentYearLaborDay = presentLaborDay.format('MMMM Do');
    this.laborDayDiff = presentLaborDay.diff(selectedLaborDay, 'days');
    let copyPositions = [];
    let canCopy = (s) => !s.training_id && !s.trainee_slot_id && !s.trainer_slot_id;
    let slotsByPosition = _.groupBy(viewSlots.filter(canCopy), 'position_id');
    if (selectedPositionId) {
      slotsByPosition = _.pick(slotsByPosition, [selectedPositionId]);
    }
    _.forOwn(
      slotsByPosition,
      (slots, positionId) => copyPositions.push(
        new CopySourcePosition({
          id: positionId,
          title: slots[0].position_title,
          controller: this,
          slots: slots.map((s) => new CopySourceSlot({controller: this, source: s}))
        })
      )
    );
    copyPositions = _.sortBy(copyPositions, 'title');
    this.copyParams = new CopyParams({deltaDays: this.laborDayDiff});
    this.copySourcePositions = copyPositions;

  }

  get positionOptionsForCopy() {
    const options = this.args.positions.map((p) => [p.title, p.id]);
    return [['(same position)', 0], ...options];
  }

  get copySelectedSlotCount() {
    return _.sumBy(this.copySourcePositions, (p) => p.selectedSlots.length);
  }

  @action
  async performCopy() {
    const params = this.copyParams;
    if (params.newPositionId > 0) {
      if (this.copySourcePositions.filter((p) => p.selectedSlots.length > 0).length > 1) {
        this.modal.info('Multiple Positions Selected', 'Sorry, multiple positions cannot be copied into a single position.');
        return;
      }
    }
    const sourceIds = this.copySourcePositions.flatMap((p) => p.selectedSlots).map((s) => s.source.id);
    if (sourceIds.length === 0) {
      this.modal.info('No Slots Selected', 'You did not select any slots to copy. Select the slots you wish to copy and try again.');
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
    ['description', 'url', 'max', 'timezone'].forEach(function (key) {
      if (params[key]) {
        data.attributes[key] = params[key];
      }
    });

    try {
      this.isSubmitting = true;
      const result = await this.ajax.request(`slot/copy`, {method: 'POST', data: data});
      if (!result.slot.length) {
        this.modal.info('No slots copied', 'Some how no slots were actually copied?!?');
        return;
      }

      this.toast.success(`Copied ${result.slot.length} slots`);

      if (+this.args.year === +this.presentYear) {
        await this.args.updateSlots();
      }
      this.args.onCancel();
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  copyPositionSelectAll(position) {
    // if all are selected, deselect all; otherwise select all
    const value = !position.allSelected;
    position.slots.forEach((s) => s.selected = value);
  }
}
