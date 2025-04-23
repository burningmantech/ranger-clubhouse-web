import Component from '@glimmer/component';
import {isEmpty} from '@ember/utils';
import {htmlSafe} from '@ember/template';

const MEALS = {
  'all': {
    title: "Eat It All Meal Pass",
    description: "Congratulations, you qualify for three meals/day during the pre-event period, the event week, and post event week using your BMID!"
  },
  'pre': {
    title: "Pre Event Meal Pass",
    description: "You qualify for three meals/day using your BMID during the Pre-Event period.<br>If you work a shift after the Pre-Event period, we'll give you a meal pog."
  },
  'post': {
    title: "Post Event Meal Pass",
    description: "You qualify for three meals/day using your BMID during the Post-Event period.<br>If you work a shift in the Pre-event period or during the event week, we'll give you a meal pog."
  },
  'event': {
    title: "Event Week Meal Pass",
    description: "You qualify for three meals/day using your BMID during the event week.<br>If you work a shift during Pre-Event period and Post-Event week, we'll give you a meal pog."
  },
  'pre+event': {
    title: "Pre-Event and During Event Pass",
    description: "You qualify for three meals/day using your BMID during both the Pre-Event period and the event week itself.<br>If you work a shift during Post-Event, we'll give you a meal pog"
  },
  'event+post': {
    title: "Event Week & Post Event Meal Pass",
    description: "You’re eligible for three meals/day during both the event week and Post-Event periods with your BMID.<br>If you work a shift during Pre-Event, we'll give you a meal pog."
  },
  'pre+post': {
    title: "Pre & Post Event Pass",
    description: "You’re eligible for three meals/day during both the Pre-Event and Post-Event periods with your BMID..<br>If you work a shift during the Event week, we'll give you a meal pog."
  },
  'pogs': {
    title: "Pogs",
    description: "Every time you work a 6+ hour shift, we'll give you a meal pog good for one of the next three meals (breakfast, lunch, or dinner)."
  },

  'no-info': {
    title: 'Pending',
    description: 'Meal information is not yet available.'
  },
};

export default class MealInfoComponent extends Component {
  constructor() {
    super(...arguments);
    const {eventInfo} = this.args;

    let {meals} = eventInfo;
    let type;
    if (isEmpty(meals)) {
      type = 'pogs';
    } else {
      const periods = [];
      if (meals.pre) {
        periods.push('pre');
      }
      if (meals.event) {
        periods.push('event');
      }

      if (meals.post) {
        periods.push('post');
      }

      if (periods.length === 3) {
        type = 'all';
      } else {
        type = periods.join('+');
      }
    }

    const mealInfo = MEALS[type];

    if (mealInfo) {
      this.title = mealInfo.title;
      this.description = htmlSafe(mealInfo.description);
      this.isBanked = eventInfo.meals_status === 'banked';
      this.isMealPass = (type === 'all' || type === 'event');
    } else {
      this.title = 'Unknown';
      this.description = `Unknown meal type ${type}. This is a bug.`;
    }
  }
}
