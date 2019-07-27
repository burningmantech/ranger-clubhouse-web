import { helper } from '@ember/component/helper';
import { config } from 'clubhouse/utils/config';
import { htmlSafe } from '@ember/string';

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
    description += `<p class="my-2">Helpful date info: ${config("MealDates")}</p>`;
  }

  return htmlSafe(`<span class="badge badge-secondary">${meal_info.title}</span> ${description}`);
}

export default helper(mealInfo);
