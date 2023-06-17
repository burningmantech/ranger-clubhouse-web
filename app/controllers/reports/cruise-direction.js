import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import EmberObject, {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import _ from "lodash";
import Selectable from "clubhouse/utils/selectable";
import dayjs from 'dayjs';
import {TYPE_SHIFT} from "clubhouse/models/pod";
import {movePod} from 'clubhouse/utils/pod';
import {htmlSafe} from '@ember/template';

export default class ReportsCruiseDirectionController extends ClubhouseController {
  @tracked shifts;
  @tracked selectedShift;

  @tracked showAddDialog;
  @tracked addPod;
  @tracked pods;

  @tracked priorShiftOptions;
  @tracked currentShiftOptions;

  @tracked suggestedSlot;

  @tracked showSortControls = false;

  @tracked showPriorShift;

  constructor() {
    super(...arguments);

    this.movePod = movePod.bind(this);
  }

  /**
   * Build a shift period list to pass to <LargeSelect>
   * @returns {[]}
   */

  get periodOptions() {
    const periods = this.shifts.map((slot) => ({slot, datetime: slot.shift_start}));
    const dayGroups = _.groupBy(periods, (dt) => dayjs(dt.datetime).format('MMDD'));

    const groups = [];


    for (const day in dayGroups) {
      const dts = dayGroups[day];
      groups.push({
        label: dayjs(dts[0].datetime).format('ddd MMM Do YYYY'),
        options: dts.map((period) => (new Selectable({
          period,
          label: dayjs(period.datetime).format('ddd MMM D @ HH:mm'),
          selected: this.selectedShift?.id === period.slot.id,
        })))
      })
    }

    return groups;
  }

  formatSelected(selected) {
    return dayjs(selected).format('YYYY ddd MMM D @ HH:mm');
  }

  @action
  togglePriorShift() {
    this.showPriorShift = !this.showPriorShift;
  }

  @action
  useSuggestedSlot() {
    this.selectedShift = this.suggestedSlot;
    this._loadSelectedPod();
  }

  @action
  changeShift(selected) {
    this.selectedShift = selected.period.slot;
    this._loadSelectedPod();
  }

  /**
   * Load the pods associated with a shift
   *
   * @returns {Promise<void>}
   * @private
   */

  async _loadSelectedPod() {
    this.isSubmitting = true;
    try {
      this.pods = await this.store.query('pod', {
        slot_id: this.selectedShift.id,
        type: TYPE_SHIFT,
        include_people: 1,
        include_photo: 1
      });
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Create a new pod.
   *
   * @returns {Promise<void>}
   */

  @action
  async createPod() {
    this.isSubmitting = true;
    try {
      const pod = await this.store.createRecord(`pod`, {
        slot_id: this.selectedShift.id,
        type: TYPE_SHIFT,
        sort_index: this.pods.length + 1,
      });
      await pod.save();
      this.pods = [...this.pods, pod];
      this.toast.success('Pod successfully created.');
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Remove a pod
   *
   * @param pod
   */

  @action
  removePod(pod) {
    this.modal.confirm('Confirm Pod Removal',
      `Are you sure you want to remove this pod?`,
      async () => {
        this.isSubmitting = true;
        try {
          await pod.destroyRecord();
          this.pods = this.pods.filter((p) => p !== pod);
          for (let i = 0; i < this.pods.length; i++) {
            const reorg = this.pods[i];
            reorg.sort_index = i + 1;
            await reorg.save();
          }
          this.toast.success('The pod has been removed.');
        } catch (response) {
          this.house.handleErrorResponse(response);
        } finally {
          this.isSubmitting = false
        }
      });
  }

  @action
  isNotLastPod(podIdx) {
    return podIdx < (this.pods.length - 1);
  }


  @action
  toggleShowSortControls() {
    this.showSortControls = !this.showSortControls;
  }

  /**
   * Setup to select and add Alphas to a pod
   *
   * @param pod
   * @returns {Promise<void>}
   */

  @action
  async setupToAdd(pod) {
    this.priorShiftOptions = [];
    this.currentShiftOptions = [];
    const shiftStart = dayjs(this.selectedShift.begins);

    this.timesheets.forEach((t) => {
      const inPod = this._inPod(t.person_id);
      const onDuty = dayjs(t.on_duty)
      const person = {
        label: htmlSafe(`${t.person.callsign} (${onDuty.format('HH:mm')}${inPod !== false ? ` Pod #${inPod}` : ''})<div class="small">${t.position.title}</div>`),
        value: t.person_id,
        disabled: inPod !== false,
      };

      if (shiftStart.diff(onDuty, 'hour') >= 1) {
        this.priorShiftOptions.push(person);
      } else {
        this.currentShiftOptions.push(person);
      }
    });

    this.peopleForm = EmberObject.create({priorPeopleIds: [], currentPeopleIds: []});
    this.addPod = pod;
    this.showAddDialog = true;
  }

  _inPod(personId) {
    let foundPod;
    this.pods.forEach((pod) => {
      pod.people.forEach((person) => {
        if (person.id === personId) {
          foundPod = pod;
        }
      })
    });

    return foundPod ? foundPod.sort_index : false;
  }

  /**
   * Add selected folks to a pod
   *
   * @param model
   * @param isValid
   * @returns {Promise<void>}
   */

  @action
  async addPerson(model, isValid) {
    if (!isValid) {
      return;
    }

    const personIds = [...model.priorPeopleIds, ...model.currentPeopleIds];

    if (!personIds.length) {
      this.model.info(null, 'No people selected.');
      return;
    }

    this.isSubmitting = true;
    try {
      let pod;
      for (let i = 0; i < personIds.length; i++) {
        pod = (await this.ajax.request(`pod/${this.addPod.id}/person`, {
          method: 'POST',
          data: {person_id: +personIds[i]}
        })).pod;
      }
      this.house.pushPayload('pod', pod);
      this.showAddDialog = false;
      this.toast.success('Person successfully removed.');
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Remove a person from a pod
   *
   * @param pod
   * @param person
   * @returns {Promise<void>}
   */

  @action
  removePerson(pod, person) {
    this.modal.confirm('Confirm removal from pod',
      `Are you want to remove ${person.callsign} from Pod #${pod.sort_index}?`,
      async () => {
        this.isSubmitting = true;
        try {
          const updatedPod = (await this.ajax.request(`pod/${pod.id}/person`, {
            method: 'DELETE',
            data: {person_id: person.id}
          })).pod;
          this.house.pushPayload('pod', updatedPod);
        } catch (response) {
          this.house.handleErrorResponse(response);
        } finally {
          this.isSubmitting = false;
        }
      });
  }

  @action
  closeAddDialog() {
    this.showAddDialog = false;
  }
}
