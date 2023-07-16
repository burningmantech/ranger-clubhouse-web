import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';
import dayjs from 'dayjs';
import {TYPE_MENTOR} from "clubhouse/models/pod";
import EmberObject from '@ember/object';
import {movePod} from 'clubhouse/utils/pod';
import {ALPHA} from "clubhouse/constants/positions";
import _ from 'lodash';

export default class MentorPodManageController extends ClubhouseController {
  @tracked slot;
  @tracked pods = [];
  @tracked isSubmitting = false;

  @tracked showAddDialog = false;
  @tracked addPod;
  @tracked addType;
  @tracked onDutyOptions;
  @tracked offDutyOptions;
  @tracked callsignForm;

  @tracked showSortControls = false;
  @tracked showOffDuty = false;

  @tracked isLead;

  constructor() {
    super(...arguments);

    this.movePod = movePod.bind(this);
  }

  @cached
  get podGroups() {
    return _.chunk(this.pods, 6);
  }

  @action
  toggleShowSortControls() {
    this.showSortControls = !this.showSortControls;
  }

  /**
   * Create a new pod. Really, create three new pods that are linked together - mentor, mitten, and alpha.
   *
   * @returns {Promise<void>}
   */

  @action
  async createPod() {
    this.isSubmitting = true;
    try {
      const {mentor, mitten, alpha} = await this.ajax.request(`pod/create-alpha-set`, {
        method: 'POST',
        data: {slot_id: this.slot.id}
      });
      const mentorPod = this.house.pushPayload('pod', mentor);
      mentorPod.mittenPod = this.house.pushPayload('pod', mitten);
      mentorPod.alphaPod = this.house.pushPayload('pod', alpha);
      this.pods = [...this.pods, mentorPod];
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Remove a pod set (mentor, mitten, alpha).
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
          await pod.mittenPod.destroyRecord();
          await pod.alphaPod.destroyRecord();
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

  /**
   * Setup to select and add mentors to a pod
   *
   * @param pod
   * @returns {Promise<void>}
   */

  @action
  async addMentor(pod) {
    this.isSubmitting = true;
    try {
      const {mentors} = await this.ajax.request('mentor/mentors');
      this._setupCallsignDialog(pod, 'Mentor', this._buildMentorOptions(mentors, 'Mentor'));
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Setup to select and add MITtens to a pod
   *
   * @param pod
   * @returns {Promise<void>}
   */

  @action
  async addMITten(pod) {
    this.isSubmitting = true;
    try {
      const {mittens} = await this.ajax.request('mentor/mittens');
      this._setupCallsignDialog(pod, 'MITten', this._buildMentorOptions(mittens, 'MITten'));
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Setup to select and add Alphas to a pod
   *
   * @param pod
   * @returns {Promise<void>}
   */

  @action
  async addAlpha(pod) {
    this.isSubmitting = true;

    try {
      const {timesheet: alphaTimesheets} = await this.ajax.request('timesheet', {
        data: {
          position_id: ALPHA,
          is_on_duty: 1
        }
      });
      const options = alphaTimesheets.map((t) => {
        const inPod = this._inPod(t.person_id, 'Alpha');
        return {
          label: `${t.person.callsign} (${dayjs(t.on_duty).format('HH:mm')}${inPod !== false ? ` Pod #${inPod}` : ''})`,
          value: t.person_id,
          disabled: inPod !== false,
        };
      });

      this._setupCallsignDialog(pod, 'Alpha', [options]);
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  _buildCallsignOption(person, type) {
    const inPod = this._inPod(person.id, type);
    return {
      label: `${person.callsign}${inPod !== false ? ` (Pod #${inPod})` : ''}`,
      value: person.id,
      disabled: inPod !== false,
    }
  }

  /**
   * Build the mentor / mitten options. Split into on duty and off duty groups.
   *
   * @param people
   * @param type
   * @private
   */

  _buildMentorOptions(people, type) {
    return [
      people.filter((p) => p.working).map((p) => this._buildCallsignOption(p, type)),
      people.filter((p) => !p.working).map((p) => this._buildCallsignOption(p, type))
    ];
  }

  /**
   * Check to see if a person is in a pod.
   *
   * @param personId
   * @param type
   * @returns {boolean|number}
   * @private
   */

  _inPod(personId, type) {
    let foundPod = null;
    personId = +personId;

    switch (type) {
      case 'Alpha':
        this.pods.forEach((pod) => {
          pod.alphaPod.people.forEach((person) => {
            if (person.id === personId) {
              foundPod = pod;
            }
          })
        });
        break;

      case 'MITten':
        this.pods.forEach((pod) => {
          pod.mittenPod.people.forEach((person) => {
            if (person.id === personId) {
              foundPod = pod;
            }
          })
        });
        break;

      default:
        this.pods.forEach((pod) => {
          pod.people.forEach((person) => {
            if (person.id === personId) {
              foundPod = pod;
            }
          })
        })
        break;
    }

    return foundPod ? foundPod.sort_index : false;
  }

  /**
   * Setup the callsign select dialog.
   *
   * @param pod
   * @param type
   * @param options
   * @private
   */

  _setupCallsignDialog(pod, type, options) {
    this.addPod = pod;
    this.addType = type;
    this.showAddDialog = true;
    this.showOffDuty = false;
    this.callsignForm = EmberObject.create({
      is_lead: false,
      onduty: [],
      offduty: [],
    });

    this.onDutyOptions = options[0];
    this.offDutyOptions = options[1];
    this.isLead = false;
  }

  @action
  toggleOffDuty() {
    this.showOffDuty = !this.showOffDuty;
  }

  @action
  closeAddDialog() {
    this.showAddDialog = false;
  }

  /**
   * Add a person into a pod. Check to ensure the person is not already a pod member.
   *
   * @returns {Promise<void>}
   */

  @action
  async addPerson(model) {
    const personIds = [...model.offduty, ...model.onduty];
    if (!personIds.length) {
      const errorMsg = 'Select one or more callsigns to add.';
      model.pushErrors('onduty', errorMsg);
      model.pushErrors('offduty', errorMsg);
      return;
    }

    this.isSubmitting = true;

    try {
      for (let i = 0; i < personIds.length; i++) {
        const data = {person_id: +personIds[i]}
        if (this.addPod.type === TYPE_MENTOR) {
          data.is_lead = model.is_lead ? 1 : 0;
        }
        const {pod} = await this.ajax.request(`pod/${this.addPod.id}/person`, {method: 'POST', data});
        this.house.pushPayload('pod', pod);
      }
      this.showAddDialog = false;
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
  async removePerson(pod, person) {
    this.isSubmitting = true;
    try {
      await this.ajax.request(`pod/${pod.id}/person`, {
        method: 'DELETE',
        data: {person_id: person.id}
      });
      await pod.reload();
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Setup to show the mentor form on the popover
   * @param pod
   * @param person
   */
  @action
  onMentorShow(pod, person) {
    this.isLead = person.is_lead;
  }

  /**
   * Update the person's "is lead" status.
   *
   * @param pod
   * @param person
   * @param closeCallback
   * @returns {Promise<void>}
   */

  @action
  async updatePerson(pod, person, closeCallback) {
    this.isSubmitting = true;

    try {
      closeCallback();
      await this.ajax.request(`pod/${pod.id}/person`, {
        method: 'PATCH',
        data: {
          person_id: person.id,
          is_lead: this.isLead ? 1 : 0,
        }
      });
      await pod.reload();
      this.toast.success(`${person.callsign} updated successfully`);
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  isNotLastPod(pod) {
    return pod.id !== this.pods[this.pods.length - 1].id;
  }
}
