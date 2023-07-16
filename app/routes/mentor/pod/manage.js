import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import {MENTOR as MENTOR_ROLE} from "clubhouse/constants/roles";
import {ALPHA} from "clubhouse/constants/positions";
import {TYPE_ALPHA, TYPE_MENTOR, TYPE_MITTEN} from "clubhouse/models/pod";

export default class MentorPodManageRoute extends ClubhouseRoute {
  requireRole = MENTOR_ROLE;

  async model({slot_id}) {
    const {slot} = await this.ajax.request(`slot/${slot_id}`);

    if (slot.position_id !== ALPHA) {
      return Promise.reject('Slot is not an Alpha shift.');
    }

    const pods = await this.store.query('pod', {slot_id: slot.id, include_people: 1});

    return {slot, pods};
  }

  setupController(controller, model) {
    const pods = model.pods;

    controller.slot = model.slot;
    controller.pods = pods.filter((pod) => pod.type === TYPE_MENTOR);
    controller.pods.forEach((mentorPod) => {
      const id = +mentorPod.id;
      mentorPod.alphaPod = pods.find((pod) => id === pod.mentor_pod_id && pod.type === TYPE_ALPHA);
      mentorPod.mittenPod = pods.find((pod) => id === pod.mentor_pod_id && pod.type === TYPE_MITTEN);
    });
    controller.pods.sort((a, b) => a.sort_index - b.sort_index);
  }
}
