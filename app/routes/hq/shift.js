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

export default class HqShiftRoute extends ClubhouseRoute {
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
    controller.unverifiedTimesheets = controller.timesheets.filter((ts) => ts.isUnverified);
    controller.endedShiftEntry = null;
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
      todos.push(new HqTodoTask(HQ_TODO_OFF_SITE));
    }

    if (!controller.isOffDuty) {
      todos.push(new HqTodoTask(HQ_TODO_END_SHIFT));
      if (controller.shiftRadios) {
        todos.push(new HqTodoTask(HQ_TODO_COLLECT_RADIO));
      }
    } else {
      todos.push(new HqTodoTask(HQ_TODO_START_SHIFT));
      if (!controller.eventRadios) {
        todos.push(new HqTodoTask(HQ_TODO_ISSUE_RADIO));
      }
    }

    if (!controller.unverifiedTimesheets.length) {
      controller.firstTab = 'shift-manage';
    } else {
      controller.firstTab = null;
    }
  }
}
