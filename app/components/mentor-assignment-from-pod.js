import Component from '@glimmer/component';
import {service} from '@ember/service';
import {ALPHA} from "clubhouse/constants/positions";
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {TYPE_ALPHA, TYPE_MENTOR} from "clubhouse/models/pod";

export default class MentorAssignmentFromPodComponent extends Component {
  @service ajax;
  @service house;

  @tracked isSubmitting = false;

  @tracked shiftOptions;
  @tracked showSelectDialog;
  @tracked shiftSelected = 0;

  @tracked slot;

  @tracked didAssign = false;
  @tracked assignedAlphas = [];
  @tracked ignoredAlphas = [];
  @tracked notFoundAlphas = [];

  /**
   * Find all the active Alpha slots in the current year.
   *
   * @returns {Promise<void>}
   */

  @action
  async selectShift() {
    this.isSubmitting = true;

    try {
      const {slot} = await this.ajax.request('slot', {data: {year: this.args.year, position_id: ALPHA, is_active: 1}});
      this.showSelectDialog = true;
      this.shiftSelected = 0;
      this.shiftOptions = slot;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  closeDialog() {
    this.showSelectDialog = false;
  }

  /**
   * Populate the mentor assignments based off how the pods are built. Track Alphas who may be in a pod
   * but are not on the Mentor Assignment page. Ignore any Alpha with already assigned mentors.
   *
   * @param slot
   * @returns {Promise<void>}
   */

  @action
  async populateShift(slot) {
    const alphasById = {};
    const mentorsByPod = {};

    this.assignedAlphas = [];
    this.ignoredAlphas = [];
    this.notFoundAlphas = [];
    this.slot = slot;

    try {
      const {pod: pods} = await this.ajax.request('pod', {data: {slot_id: slot.id, include_people: 1}});
      const mentorPods = pods.filter((p) => p.type === TYPE_MENTOR);
      const alphaPods = pods.filter((p) => p.type === TYPE_ALPHA);
      if (!mentorPods.length) {
        this.toast.error('No mentor pods were found.');
        return;
      }

      if (!alphaPods.length) {
        this.toast.error('No alpha pods were found.');
        return;
      }

      this.didAssign = true;

      mentorPods.forEach((p) => mentorsByPod[p.id] = p.people.map((person) => person.id));

      this.args.alphas.forEach((person) => alphasById[person.id] = person);

      alphaPods.forEach((pod) => {
        pod.people.forEach((person) => {
          const assignment = alphasById[person.id];

          if (!assignment) {
            this.notFoundAlphas.push(person.callsign);
            return;
          }

          const mentors = mentorsByPod[pod.mentor_pod_id];
          if (!mentors) {
            return;
          }

          for (let i = 0; i < mentors.length && i < assignment.mentors.length; i++) {
            assignment.mentors[i].mentor_id = mentors[i];
          }
          this.assignedAlphas.push(person.callsign);
        });
      });
      this.showSelectDialog = false;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }
}
