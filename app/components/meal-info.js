import Component from '@glimmer/component';

const MEALS = {
  'all': {
    title: "Eat It All",
    description: "Congratulations, you qualify for three meals/day using your BMID before, during, and after the Event!"
  },
  'pre': {
    title: "Pre Event",
    description: "You qualify for three meals/day using your BMID during the Pre-Event period.<br>If you work a shift after Pre-Event, we'll give you a meal pog."
  },
  'post': {
    title: "Post Event",
    description: "You qualify for three meals/day using your BMID during the Post-Event period.<br>If you work a shift before Post-Event, we'll give you a meal pog."
  },
  'event': {
    title: "During Event",
    description: "You qualify for three meals/day using your BMID during the Event.<br>If you work a shift during Pre- and Post-Event, we'll give you a meal pog."
  },
  'pre+event': {
    title: "Pre and During Event",
    description: "You qualify for three meals/day using your BMID during Pre-Event and during the Event week itself.<br>If you work a shift during Post-Event, we'll give you a meal pog"
  },
  'event+post': {
    title: "During and Post Event",
    description: "You qualify for three meals/day using your BMID during the Event and Post-Event.<br>If you work a shift during Pre-Event, we'll give you a meal pog."
  },
  'pre+post': {
    title: "Pre and Post Event",
    description: "You qualify for three meals/day using your BMID Pre-Event and Post-Event.<br>If you work a shift during the Event week, we'll give you a meal pog."
  },
  'pogs': {
    title: "Meal Pogs",
    description: "Every time you work a shift, we'll give you a meal pog good for one of the next three meals (breakfast, lunch, or dinner)."
  },

  'no-info': {
    title: 'Pending',
    description: 'Meal information is not yet available.'
  }
};

export default class MealInfoComponent extends Component {
  get title() {
    const mealInfo = this._mealInfo();

    if (mealInfo) {
      return mealInfo.title;
    }

    return `Unknown`;
  }

  get description() {
    const mealInfo = this._mealInfo();

    if (mealInfo) {
      return mealInfo.description;
    }

    return `Unknown meal type ${this.args.meals}. This is a bug.`;
  }

  _mealInfo() {
    const meals = this.args.meals;
    return meals ? MEALS[meals] : MEALS['pogs'];
  }
}
