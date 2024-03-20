import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import RSVP from 'rsvp';
import {
  HQ_TODO_COLLECT_RADIO,
  HQ_TODO_END_SHIFT,
  HQ_TODO_START_SHIFT,
  HQ_TODO_VERIFY_TIMESHEET,
  HQ_TODO_ISSUE_RADIO,
  HQ_TODO_DELIVERY_MESSAGE,
  HqTodoTask, HQ_TODO_OFF_SITE,
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

    const todos = [];
    controller.todos = todos;

    if (controller.person.unread_message_count) {
      todos.push(new HqTodoTask(HQ_TODO_DELIVERY_MESSAGE));
    }

    if (controller.unverifiedTimesheets.length) {
      todos.push(new HqTodoTask(HQ_TODO_VERIFY_TIMESHEET));
    }

    const {upcomingSlots} = model;

    if (!upcomingSlots.imminent.length && !upcomingSlots.upcoming.length) {
      controller.askIfDone = new HqTodoTask(HQ_TODO_OFF_SITE, false, true);
    } else {
      controller.askIfDone = null;
    }

    if (!controller.isOffDuty) {
      todos.push(new HqTodoTask(HQ_TODO_END_SHIFT));
    } else {
      todos.push(new HqTodoTask(HQ_TODO_START_SHIFT));
      if (!controller.eventRadios) {
        todos.push(new HqTodoTask(HQ_TODO_ISSUE_RADIO));
      }
    }

    if (controller.collectRadioCount) {
      todos.push(new HqTodoTask(HQ_TODO_COLLECT_RADIO));
    }
  }
}
