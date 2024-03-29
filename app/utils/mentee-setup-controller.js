import _ from "lodash";

export default function menteeSetupController(controller, menteeList) {
  controller.menteeList = menteeList;

  let totalPassed = 0, totalBonked = 0;

  menteeList.forEach((year) => {
    year.mentees.forEach((mentee) => {
      if (mentee.mentor_status === 'pass') {
        totalPassed += 1;
      } else {
        totalBonked += 1;
      }
    })
  });

  controller.totalMentees = totalPassed + totalBonked;
  controller.totalPassed = totalPassed;
  controller.totalBonked = totalBonked;
  if (menteeList.length > 0) {
    // server return list in descending order
    controller.lastYear = _.first(menteeList).year;
    controller.firstYear = _.last(menteeList).year;
  } else {
    controller.firstYear = 0;
    controller.lastYear = 0;
  }
}
