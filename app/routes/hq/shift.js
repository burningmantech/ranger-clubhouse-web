import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import RSVP from 'rsvp';
import {
  HQ_TODO_COLLECT_RADIO,
  HQ_TODO_END_SHIFT,
  HQ_TODO_START_SHIFT,
  HQ_TODO_VERIFY_TIMESHEET,
  HQ_TODO_ISSUE_RADIO,
  HQ_TODO_DELIVERY_MESSAGE,
  HqTodoTask, HQ_TODO_OFF_SITE, HQ_TODO_COLLECT_RADIO_IF_DONE,
} from "clubhouse/constants/hq-todo";
import {isEmpty} from "lodash";

export default class HqShiftRoute extends ClubhouseRoute {
  constructor() {
    super(...arguments);

    this.router.on('routeWillChange', (transition) => {
      const controller = this.controllerFor('hq.shift');

      if (!transition.from?.find(route => route.name === this.routeName)) {
        return;
      }

      if (isEmpty(controller.unsubmittedBarcode)) {
        return;
      }

      if (!controller.showUnsubmittedBarcodeDialog) {
        // May see multiple route transitions, only abort once.
        controller.showUnsubmittedBarcodeDialog = true;
        transition.abort();
      }
    });
  }

  model() {
    const person_id = this.modelFor('hq').person.id;
    const year = this.house.currentYear();

    return RSVP.hash({
      upcomingSlots: this.ajax.request(`person/${person_id}/schedule/upcoming`),
      scheduleRecommendations: this.ajax.request(`person/${person_id}/schedule/recommendations`),
      timesheets: this.store.query('timesheet', {person_id, year}),
    });
  }

  setupController(controller, model) {
    const hqModel = this.modelFor('hq');
    controller.setProperties(model);
    controller.setProperties(hqModel);
    controller.endedShiftEntry = null;
    controller.unsubmittedBarcode = '';
    controller._findOnDuty();
    controller.timesheetsToReview = model.timesheets.filter((t) => t.isUnverified);

    controller.todos = [];

    if (controller.person.unread_message_count) {
      controller.setupTodo(HQ_TODO_DELIVERY_MESSAGE);
    }

    if (controller.timesheetsToReview.length) {
      controller.setupTodo(HQ_TODO_VERIFY_TIMESHEET);
    }

    const {upcomingSlots} = model;

    let noMoreScheduled = false;
    if (!upcomingSlots.imminent.length && !upcomingSlots.upcoming.length) {
      controller.askIfDone = new HqTodoTask(HQ_TODO_OFF_SITE, false, true);
      noMoreScheduled = true;
    } else {
      controller.askIfDone = null;
    }

    let radioTask = null;
    if (!controller.isOffDuty) {
      controller.setupTodo(HQ_TODO_END_SHIFT);
      if (controller.collectRadioCount) {
        radioTask = HQ_TODO_COLLECT_RADIO;
      } else if (controller.eventRadios && noMoreScheduled) {
        radioTask = HQ_TODO_COLLECT_RADIO_IF_DONE;
      }
    } else {
      controller.setupTodo(HQ_TODO_START_SHIFT);
      const radioMax = controller.eventInfo.radio_max;
      if (radioMax > 0) {
        if (controller.collectRadioCount) {
          // Person is above the event radio checkout limit and/or has a shift radio
          radioTask = HQ_TODO_COLLECT_RADIO;
        } else if (noMoreScheduled && controller.eventRadios) {
          // Has radios, and has no more upcoming shifts.
          radioTask = HQ_TODO_COLLECT_RADIO_IF_DONE;
        } else if (controller.eventRadios < radioMax) {
          // Below their event radio issue count,
          radioTask = HQ_TODO_ISSUE_RADIO;
        }
        // else, has an event radio, and still working - don't nag.
      } else if (controller.collectRadioCount) {
        // Off duty with radios, and not event authorized?
        radioTask = HQ_TODO_COLLECT_RADIO;
      } else {
        // No radio - Give 'em one.
        radioTask = HQ_TODO_ISSUE_RADIO;
      }
    }

    if (radioTask) {
      controller.setupTodo(radioTask);
    }
  }
}
