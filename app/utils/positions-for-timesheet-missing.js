import {DIRT} from "clubhouse/constants/positions";
import _ from "lodash";

export default function positionsForTimesheetMissing(positions) {
  const options = positions.filter((p) => !p.not_timesheet_eligible).map((p) => [p.title, p.id]);
  const dirt = options.find((p) => p[1] === DIRT);
  if (dirt) {
    _.pull(options, dirt);
    options.unshift(dirt);
  }

  return options;
}
