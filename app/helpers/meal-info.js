import { helper } from '@ember/component/helper';
import { config } from 'clubhouse/helpers/config';
import { htmlSafe } from '@ember/string';

const MEALS = {
  'all': {
    title: "Eat It All",
    description: "Congratulations, you qualify for three meals/day using your BMID before, during, and after the Event!"
  },
  'pre': {
    title: "Pre Event",
    description: "you qualify for three meals/day using your BMID during the Pre-Event period. After Pre-Event, if you work a shift, we'll give you a meal pog."
  },
  'post': {
    title: "Post Event",
    description: "you qualify for three meals/day using your BMID during the Post-Event period.  Before Post-Event, if you work a shift, we'll give you a meal pog."
  },
  'event': {
    title: "During Event",
    description: "you qualify for three meals/day using your BMID during the Event.  Pre- and Post-Event, if you work a shift, we'll give you a meal pog."
  },
  'pre+event': {
    title: "Pre and During Event",
    description: "you qualify for three meals/day using your BMID during Pre-Event and during the Event week itself.  Post-Event, if you work a shift, we'll give you a meal pog"
  },
  'event+post': {
    title: "During and Post Event",
    description: "you qualify for three meals/day using your BMID during the Event and Post-Event. Pre-Event, if you work a shift, we'll give you a meal pog."
  },
  'pre+post': {
    title: "Pre and Post Event",
    description: "you qualify for three meals/day using your BMID Pre-Event and Post-Event.  During the Event week, if you work a shift, we'll give you a meal pog."
  },
  'pogs': {
    title: "Meal Pogs",
    description: "every time you work a shift, we'll give you a meal pog good for one of the next three meals (breakfast, lunch, or dinner)."
  }
};

export function mealInfo([meal]) {
  let meal_info;

  if (meal == 'no-info') {
    return 'Meal information for this year is not yet available';
  }

  if (meal) {
    meal_info = MEALS[meal];

    if (!meal_info) {
      return `Unknown meal type [${meal}]`;
    }
  } else {
    meal_info = MEALS['pogs'];
  }

  let description = meal_info.description;

  if (meal && meal != "all") {
    description += `<p>Helpful date info: ${config("MealDates")}</p>`;
  }

  return htmlSafe(`<span class="badge badge-secondary">${meal_info.title}</span> ${description}`);
}

export default helper(mealInfo);
