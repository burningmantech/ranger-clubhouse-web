import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';
import dayjs from 'dayjs';
import {TYPE_MENTOR} from "clubhouse/models/pod";
import EmberObject from '@ember/object';
import {movePod} from 'clubhouse/utils/pod';
import {htmlSafe} from '@ember/template';

import {
  ALPHA,
  MENTOR, MENTOR_APPRENTICE,
  MENTOR_CHEETAH,
  MENTOR_KHAKI,
  MENTOR_LEAD, MENTOR_MITTEN,
  MENTOR_RADIO_TRAINER,
  MENTOR_SHORT,
  MENTOR_WHEEL_OF_MANY_WAYS
} from "clubhouse/constants/positions";
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
  @tracked peoplePositionsOptions;
  @tracked callsignForm;

  @tracked showSortControls = false;
  @tracked showOffDuty = false;
  @tracked showPeoplePositions = false;

  @tracked isLead;

  @tracked podIndex;
  @tracked podOptions;

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

  _clearToggles() {
    this.showOffDuty = false;
    this.showPeoplePositions = false;
  }

  @action
  alphaCallsign(alpha) {
    let callsign = alpha.callsign;
    if (alpha.prior_bonk) {
      callsign += ' <span class="badge text-bg-warning">B</span'
    }

    return htmlSafe(callsign);
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
    this._clearToggles();
    try {
      const mentors = (await this.ajax.request('timesheet', {
        data: {
          is_on_duty: 1,
          position_ids: [
            MENTOR,
            MENTOR_CHEETAH,
            MENTOR_KHAKI,
            MENTOR_LEAD,
            MENTOR_RADIO_TRAINER,
            MENTOR_SHORT,
            MENTOR_WHEEL_OF_MANY_WAYS
          ],
        }
      })).timesheet.map((t) => ({
        id: t.person.id,
        callsign: t.person.callsign,
        on_duty: t.on_duty,
        position_title: t.position.title
      }));

      const {mentors: allMentors} = await this.ajax.request('mentor/mentors');

      mentors.sort((a, b) => a.callsign.localeCompare(b.callsign));

      const beforeHour = dayjs(this.slot.begins).subtract(1, 'hour').unix();
      const afterHour = dayjs(this.slot.begins).add(1, 'hour').unix();

      const currentMentors = [];
      const otherMentors = [];

      const workingById = {}
      mentors.forEach((mentor) => {
        const ts = dayjs(mentor.on_duty).unix();
        workingById[mentor.id] = true;
        if (ts >= beforeHour && ts <= afterHour) {
          currentMentors.push(mentor);
        } else {
          otherMentors.push(mentor);
        }
      })

      this._setupCallsignDialog(pod, 'Mentor',
        [
          currentMentors.map((p) => this._buildCallsignOption(p, 'Mentor')),
          otherMentors.map((p) => this._buildCallsignOption(p, 'Mentor')),
          allMentors.filter((m) => !m.working && !workingById[m.id]).map((p) => ({label: p.callsign, value: p.id}))
        ]);
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
    this._clearToggles();
    try {
      const {mittens} = await this.ajax.request('mentor/mittens');
      const allMittens = mittens.filter((m) => !m.working);
      const workingMittens = (await this.ajax.request('timesheet', {
        data: {
          is_on_duty: 1,
          position_ids: [
            MENTOR_MITTEN,
            MENTOR_APPRENTICE,
           ],
        }
      })).timesheet.map((t) => ({
        id: t.person.id,
        callsign: t.person.callsign,
        on_duty: t.on_duty,
        position_title: t.position.title
      }));

      const beforeHour = dayjs(this.slot.begins).subtract(1, 'hour').unix();
      const afterHour = dayjs(this.slot.begins).add(1, 'hour').unix();

      const currentMITtens = [];
      const otherMITtens = [];

      workingMittens.forEach((mitten) => {
          const ts = dayjs(mitten.on_duty).unix();
          if (ts >= beforeHour && ts <= afterHour) {
            currentMITtens.push(mitten);
          } else {
            otherMITtens.push(mitten);
          }
      })

      this._setupCallsignDialog(pod, 'MITten', [
        currentMITtens.map((p) => this._buildCallsignOption(p, 'MITten')),
        otherMITtens.map((p) => this._buildCallsignOption(p, 'MITten')),
        allMittens.map((p) => ({ label: p.callsign, value: p.id }))
      ]);
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
    this._clearToggles();

    try {
      const alphaTimesheets = (await this.ajax.request('timesheet', {
        data: {
          position_id: ALPHA,
          is_on_duty: 1
        }
      })).timesheet.map((t) => ({
        id: t.person.id,
        callsign: t.person.callsign,
        on_duty: t.on_duty,
        position_title: t.position.title
      }));

      const offDutyAlphas = (await this.ajax.request('mentor/alphas', {data: {off_duty: 1}})).alphas;

      const beforeHour = dayjs(this.slot.begins).subtract(1, 'hour').unix();
      const afterHour = dayjs(this.slot.begins).add(1, 'hour').unix();

      const currentAlphas = [];
      const otherAlphas = [];

      alphaTimesheets.forEach((alpha) => {
        const ts = dayjs(alpha.on_duty).unix();
        const person = this._buildCallsignOption(alpha, 'Alpha');
        if (ts >= beforeHour && ts <= afterHour) {
          currentAlphas.push(person);
        } else {
          otherAlphas.push(person);
        }
      });

      this._setupCallsignDialog(pod, 'Alpha', [
        currentAlphas, otherAlphas, offDutyAlphas.map((a) => ({label: a.callsign, value: a.id}))
      ]);
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  _buildCallsignOption(person, type) {
    const inPod = this._inPod(person.id, type);

    let label = `${person.callsign} (${dayjs(person.on_duty).format('HH:mm')}${inPod !== false ? `, Pod #${inPod}` : ''})`;
    if (type !== 'Alpha' && person.position_title) {
      label += `<br>${person.position_title}`;
    }

    return {
      label: htmlSafe(label),
      value: person.id,
      disabled: inPod !== false,
    }
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
      peoplePositions: []
    });

    this.onDutyOptions = options[0];
    this.offDutyOptions = options[1];
    this.peoplePositionsOptions = options[2];
    this.isLead = false;
  }

  @action
  toggleOffDuty() {
    this.showOffDuty = !this.showOffDuty;
  }

  @action
  togglePeoplePositions() {
    this.showPeoplePositions = !this.showPeoplePositions;
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
    const personIds = [...model.offduty, ...model.onduty, ...model.peoplePositions];
    if (!personIds.length) {
      const errorMsg = 'Select one or more callsigns to add.';
      model.pushErrors('onduty', errorMsg);
      model.pushErrors('offduty', errorMsg);
      model.pushErrors('peoplePositions', errorMsg);
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
    this.podIndex = pod.id;
    this.podOptions = this.pods.map((pod) => [`Pod ${pod.sort_index}`, pod.id]);
  }

  @action
  onMITtenShow(pod) {
    this.podIndex = pod.id;
    this.podOptions = this.pods.map((pod) => [`Pod ${pod.sort_index}`, pod.mittenPod.id]);
  }

  @action
  onAlphaShow(pod) {
    this.podIndex = pod.id;
    this.podOptions = this.pods.map((pod) => [`Pod ${pod.sort_index}`, pod.alphaPod.id]);
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
      if (+this.podIndex !== pod.id) {
        const data = {person_id: person.id};
        await this.ajax.request(`pod/${pod.id}/person`, {
          method: 'DELETE',
          data
        });
        if (pod.type === TYPE_MENTOR) {
          data.is_lead = this.isLead ? 1 : 0;
        }
        const {pod: newPod} = await this.ajax.request(`pod/${this.podIndex}/person`, {method: 'POST', data});
        this.house.pushPayload('pod', newPod);
      } else {
        await this.ajax.request(`pod/${pod.id}/person`, {
          method: 'PATCH',
          data: {
            person_id: person.id,
            is_lead: this.isLead ? 1 : 0,
          }
        });
      }
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

