import ClubhouseController from "clubhouse/controllers/clubhouse-controller";

export default class MentorPodIndexController extends ClubhouseController {
  inProgress(slot) {
    return slot.has_started && !slot.has_ended;
  }
}
