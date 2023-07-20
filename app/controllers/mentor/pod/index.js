import ClubhouseController from "clubhouse/controllers/clubhouse-controller";

export default class MentorPodIndexController extends ClubhouseController {
  inProgress(slot) {
    console.log('slot ', slot.has_started && !slot.has_ended, slot.has_started, slot.has_ended);
    return slot.has_started && !slot.has_ended;
  }
}
