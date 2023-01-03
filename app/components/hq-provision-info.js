import Component from '@glimmer/component';
import {isEmpty} from '@ember/utils';
import {
  MENTOR,
  MENTOR_APPRENTICE,
  MENTOR_KHAKI,
  MENTOR_MITTEN,
  MENTOR_LEAD,
  MENTOR_SHORT
} from 'clubhouse/constants/positions';


// Who is allowed to receive two pogs during their shift
const TWO_POGS_POSITIONS = [
  MENTOR,
  MENTOR_APPRENTICE,
  MENTOR_MITTEN,
  MENTOR_LEAD,
  MENTOR_KHAKI,
  MENTOR_SHORT,
];

const MEAL_POGS = {
  'pre': {
    exclude: 'PRE-EVENT',
    issue: 'Event Week & Post-Event'
  },
  'pre+event': {
    exclude: 'PRE-EVENT & EVENT WEEK',
    issue: 'Post-Event'
  },
  'pre+post': {
    exclude: 'PRE-EVENT & POST-EVENT',
    issue: 'Event Week',
  },
  'event': {
    exclude: 'EVENT WEEK',
    issue: 'Pre-Event & Post-Event'
  },
  'event+post': {
    exclude: 'EVENT WEEK & POST-EVENT',
    issue: 'Pre-Event'
  },
  'post': {
    exclude: 'POST-EVENT',
    issue: 'Pre-Event & Event Week'
  }
}

export default class HqProvisionInfoComponent extends Component {
  get hasEatItAll() {
    return this.args.eventInfo.meals === 'all';
  }

  get onlyPogs() {
    return isEmpty(this.args.eventInfo.meals);
  }

  get mealPogInfo() {
    return MEAL_POGS[this.args.eventInfo.meals];
  }

  get mayRequestTwoMealPogs() {
    const {onDutyEntry, eventInfo} = this.args;
    if (this.hasEatItAll || eventInfo.meals?.match(/event/)) {
      return false;
    }
    return !!(onDutyEntry && TWO_POGS_POSITIONS.includes(onDutyEntry.position_id));
  }
}
