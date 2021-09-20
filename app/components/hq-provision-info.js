import Component from '@glimmer/component';
import {isEmpty} from '@ember/utils';

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
    exclude: 'PRE-EVENT & EVENT WEEK',
    issue: 'Post-Event'
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
    console.log('MEALS POGS', this.args.eventInfo)
    return MEAL_POGS[this.args.eventInfo.meals];
  }
}
