import {tracked} from '@glimmer/tracking';

export const HQ_TODO_COLLECT_RADIO = 'collect-radio';
export const HQ_TODO_DELIVERY_MESSAGE = 'delivery-message';
export const HQ_TODO_END_SHIFT = 'end-shift';
export const HQ_TODO_ISSUE_RADIO = 'issue-radio';
export const HQ_TODO_MEAL_POG = 'meal-pog';
export const HQ_TODO_MEAL_POG_NONE = 'no-meal-pog';
export const HQ_TODO_NO_RADIO = 'no-radio';
export const HQ_TODO_START_SHIFT = 'start-shift';
export const HQ_TODO_VERIFY_TIMESHEET = 'verify-timesheet';
export const HQ_TODO_OFF_SITE = 'off-site';
export const HQ_TODO_COLLECT_RADIO_IF_DONE = 'collect-radio-if-done';

export const HqTodoLabels = {
  [HQ_TODO_COLLECT_RADIO]: 'Collect Radio',
  [HQ_TODO_COLLECT_RADIO_IF_DONE]: 'Collect Radio (if done working)',
  [HQ_TODO_DELIVERY_MESSAGE]: 'Delivery Message(s)',
  [HQ_TODO_END_SHIFT]: 'End The Shift',
  [HQ_TODO_ISSUE_RADIO]: 'Checkout Radio',
  [HQ_TODO_MEAL_POG]: 'Issue Meal Pog (if qualified)',
  [HQ_TODO_MEAL_POG_NONE]: 'No Meal Pog - Has Meal Pass',
  [HQ_TODO_NO_RADIO]: 'Working Burn Perimeter - May not need a radio',
  [HQ_TODO_START_SHIFT]: 'Start A Shift',
  [HQ_TODO_VERIFY_TIMESHEET]: 'Review Timesheet',
  [HQ_TODO_OFF_SITE]: 'No more upcoming shifts - Ask if finished rangering',
};

export class HqTodoTask {
  @tracked completed = false;
  @tracked ignore = false;
  @tracked message;

  constructor(task, ignore = false, blink = false) {
    this.task = task;
    this.message = HqTodoLabels[task];
    this.ignore = ignore;
    this.blink = blink;
  }
}
