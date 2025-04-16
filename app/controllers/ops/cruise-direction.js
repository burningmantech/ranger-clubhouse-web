import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import EmberObject, {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';
import _ from "lodash";
import Selectable from "clubhouse/utils/selectable";
import dayjs from 'dayjs';
import PodModel, {TYPE_SHIFT, TransportOptions} from "clubhouse/models/pod";
import {movePod,movePodTo} from 'clubhouse/utils/pod';
import {htmlSafe} from '@ember/template';

export default class OpsCruiseDirectionController extends ClubhouseController {
  queryParams = ['year'];

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

  @tracked editPod;

  @tracked editPerson;
  @tracked editPersonPod;
  @tracked editPersonForm;

  @tracked isNewPod = false;

  @tracked positions;

  @tracked showingPositions = false;

  @tracked isSubmitting = false;

  transportOptions = TransportOptions;

  constructor() {
    super(...arguments);

    this.movePod = movePod.bind(this);
    this.movePodTo = movePodTo.bind(this);
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
    this._loadSelectedShift();
  }

  @action
  changeShift(selected) {
    this.selectedShift = selected.period.slot;
    this._loadSelectedShift();
  }

  @action
  togglePositions() {
    this.showingPositions = !this.showingPositions;
  }

  @cached
  get podOptions() {
    return this.pods.map((pod) => [htmlSafe(`Pod #${pod.sort_index} - ${pod.location} - ${pod.transportLabel}`), pod.id]);
  }

  /**
   * Load the pods associated with a shift
   *
   * @returns {Promise<void>}
   * @private
   */

  async _loadSelectedShift(successCallback = null) {
    this.isSubmitting = true;
    try {
      this.pods = await this.store.query('pod', {
        slot_id: this.selectedShift.id,
        type: TYPE_SHIFT,
        include_people: 1,
        include_photo: 1
      });
      successCallback?.();
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  refreshPage() {
    this._loadSelectedShift(() => this.toast.success('Page was successfully refreshed.'));
  }

  /**
   * Create a new pod.
   *
   * @returns {Promise<void>}
   */

  @action
  createPod() {
    this.editPod = this.store.createRecord(`pod`, {
      slot_id: this.selectedShift.id,
      type: TYPE_SHIFT,
      sort_index: this.pods.length + 1,
    });
  }

  @action
  editExistingPod(pod) {
    this.editPod = pod;
  }

  @action
  async savePod(model) {
    const {isNew} = this.editPod;
    const pod = this.editPod;
    this.isSubmitting = true;
    try {
      await model.save();
      if (isNew) {
        this.pods = [...this.pods, this.editPod];
      }
      this.editPod = null;
      this.toast.success('Pod successfully saved.');
    } catch (response) {
      this.house.handleErrorResponse(response);
      return;
    } finally {
      this.isSubmitting = false;
    }

    if (isNew) {
      this.isNewPod = true;
      this.setupToAdd(pod);
    }
  }

  @action
  cancelPod() {
    this.editPod = null;
  }

  /**
   * Remove a pod
   *
   * @param pod
   */

  @action
  deletePod() {
    this.modal.confirm('Confirm Pod Deletion',
      `Are you sure you want to delete this pod?`,
      async () => {
        const pod = this.editPod;
        this.isSubmitting = true;
        try {
          await pod.destroyRecord();
          this.editPod = null;

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
  isNotLastPod(pod) {
    return this.pods[this.pods.length - 1] !== pod;
  }


  @action
  toggleShowSortControls() {
    this.showSortControls = !this.showSortControls;
  }

  /**
   * Setup to select and add folks to a pod
   *
   * @param pod
   * @returns {Promise<void>}
   */

  @action
  async setupToAdd(pod) {
    this.priorShiftOptions = [];
    this.currentShiftOptions = [];
    const shiftStart = dayjs(this.selectedShift.begins);

    this.isSubmitting = true;
    try {
      this.timesheets = (await this.ajax.request('timesheet', {
        data: {
          is_on_duty: 1,
          position_ids: this.positionIds,
          include_photo: 1
        }
      })).timesheet;
    } catch (response) {
      this.house.handleErrorResponse(response);
      return;
    } finally {
      this.isSubmitting = false;
    }

    this.timesheets.forEach((t) => {
      if (this._inPod(t.person_id) !== false) {
        return;
      }

      const onDuty = dayjs(t.on_duty)
      const person = {
        label: htmlSafe(`${t.person.callsign} (${onDuty.format('HH:mm')})<div class="small">${t.position.title}</div>`),
        value: t.person_id,
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
        pod = (await this.ajax.post(`pod/${this.addPod.id}/person`, {
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
  editPersonInPod(pod, person) {
    this.editPerson = person;
    this.editPersonPod = pod;
    this.editPersonForm = EmberObject.create({podId: pod.id});
  }

  @action
  async savePerson(model, isValid) {
    if (!isValid) {
      return;
    }

    const person = this.editPerson;
    this.editPerson = null;
    if (+model.podId !== this.editPersonPod.id) {
      await this._movePersonToPod(person.id, this.editPersonPod.id, model.podId);
    }
  }

  @action
  cancelPerson() {
    this.editPerson = null;
  }


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

  @action
  async thingDroppedOnPod(newPod, data) {
    if (data instanceof PodModel) {
      const oldPod = data;

      if (newPod.id === oldPod.id) {
        return;
      }

      await this.movePodTo(oldPod, newPod.sort_index)
      return;
    }

    const [person, oldPod] = data;

    if (newPod.id === oldPod.id) {
      return;
    }

    await this._movePersonToPod(person.id, oldPod.id, newPod.id);
  }

  async _movePersonToPod(personId, oldPodId, newPodId) {
    try {
      this.isSubmitting = true;
      await this.ajax.patch(`pod/${oldPodId}/move/${personId}/${newPodId}`);
      await this._loadSelectedShift();
      this.toast.success('Person successfully moved.');
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  closePositions() {
    this.showingPositions = false;
  }
}
