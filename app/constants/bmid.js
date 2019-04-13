
export const BmidStatusLabels = {
  in_prep: 'Prep',
  do_not_print: 'Do Not Print',
  ready_to_print: 'Ready To Print',
  ready_to_reprint_lost: 'Ready To Reprint (Lost)',
  ready_to_reprint_changed: 'Ready To Reprint (Changed)',
  issues: 'Issues',
  submitted: 'Submitted',
};

export const BmidStatusOptions = [
  ['Prep', 'in_prep'],
  ['Do Not Print', 'do_not_print'],
  ['Ready To Print', 'ready_to_print'],
  ['Ready To Reprint (Lost)', 'ready_to_reprint_lost'],
  ['Ready To Reprint (Changed)', 'ready_to_reprint_changed'],
  ['Issues', 'issues'],
  ['Submitted', 'submitted']
];

export const MealLabels = {
  pre: 'Pre',
  post: 'Post',
  event: 'Event',
  all: 'All',
  'pre+post': 'Pre+Post',
  'pre+event': 'Pre+Event',
  'event+post': 'Event+Post',
};

export const MealOptions = [
  ['None', ''],
  ['Pre', 'pre'],
  ['Post', 'post'],
  ['Event', 'event'],
  ['All', 'all'],
  ['Pre+Post', 'pre+post'],
  ['Pre+Event', 'pre+event'],
  ['Event+Post', 'event+post']
];

export const ShowerOptions = [
  [ 'No', false ],
  [ 'Yes', true ],
];
