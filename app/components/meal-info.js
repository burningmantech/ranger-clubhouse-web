import Component from '@glimmer/component';
import {isEmpty} from '@ember/utils';

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
    description: "You qualify for three meals/day using your BMID during Pre-Event period and the event week itself.<br>If you work a shift during Post-Event, we'll give you a meal pog"
  },
  'event+post': {
    title: "Event Week & Post Event Meal Pass",
    description: "You qualify for three meals/day using your BMID during the Event and Post-Event.<br>If you work a shift during Pre-Event, we'll give you a meal pog."
  },
  'pre+post': {
    title: "Pre & Post Event Pass",
    description: "You qualify for three meals/day using your BMID Pre-Event and Post-Event.<br>If you work a shift during the Event week, we'll give you a meal pog."
  },
  'pogs': {
    title: "Pogs",
    description: "Every time you work a shift, we'll give you a meal pog good for one of the next three meals (breakfast, lunch, or dinner)."
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
    if (isEmpty(meals)) {
      meals = 'pogs';
    }

    const mealInfo = MEALS[meals];

    if (mealInfo) {
      this.title = mealInfo.title;
      this.description = mealInfo.description;
      this.isBanked = eventInfo.meals_status === 'banked';
      this.isMealPass = (meals === 'all' || meals === 'event');
    } else {
      this.title = 'Unknown';
      this.description = `Unknown meal type ${this.args.meals}. This is a bug.`;
    }
  }
}
