import {
  IN_PREP,  DO_NOT_PRINT,
  READY_TO_PRINT, READY_TO_REPRINT_CHANGE, READY_TO_REPRINT_LOST,
  ISSUES, SUBMITTED,
  MEALS_ALL,
  MEALS_PRE, MEALS_PRE_PLUS_EVENT, MEALS_PRE_PLUS_POST,
  MEALS_EVENT, MEALS_EVENT_PLUS_POST,
  MEALS_POST
} from 'clubhouse/models/bmid';

export const BmidStatusLabels = {
  [IN_PREP]: 'Prep',
  [DO_NOT_PRINT]: 'Do Not Print',
  [READY_TO_PRINT]: 'Ready To Print',
  [READY_TO_REPRINT_LOST]: 'Ready To Reprint (Lost)',
  [READY_TO_REPRINT_CHANGE]: 'Ready To Reprint (Changed)',
  [ISSUES]: 'Issues',
  [SUBMITTED]: 'Submitted',
};

export const BmidStatusOptions = [
  ['Prep', IN_PREP],
  ['Do Not Print', DO_NOT_PRINT],
  ['Ready To Print', READY_TO_PRINT],
  ['Ready To Reprint (Lost)', READY_TO_REPRINT_LOST],
  ['Ready To Reprint (Changed)', READY_TO_REPRINT_CHANGE],
  ['Issues', ISSUES],
  ['Submitted', SUBMITTED]
];

export const MealLabels = {
  [MEALS_PRE]: 'Pre',
  [MEALS_POST]: 'Post',
  [MEALS_EVENT]: 'Event',
  [MEALS_ALL]: 'All',
  [MEALS_PRE_PLUS_POST]: 'Pre+Post',
  [MEALS_PRE_PLUS_EVENT]: 'Pre+Event',
  [MEALS_EVENT_PLUS_POST]: 'Event+Post',
};

export const MealOptions = [
  ['None', ''],
  ['Pre', MEALS_PRE],
  ['Post', MEALS_POST],
  ['Event', MEALS_EVENT],
  ['All', MEALS_ALL],
  ['Pre+Post', MEALS_PRE_PLUS_POST],
  ['Pre+Event', MEALS_PRE_PLUS_EVENT],
  ['Event+Post', MEALS_EVENT_PLUS_POST]
];

export const ShowerOptions = [
  ['No', false],
  ['Yes', true],
];
