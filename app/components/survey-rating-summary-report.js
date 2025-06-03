import Component from '@glimmer/component';
import {TYPE_NORMAL, TYPE_TRAINER} from 'clubhouse/models/survey-group';
import {map} from "lodash";
import {service} from '@ember/service';
import {action} from '@ember/object';

const SUMMARY_COLUMNS = [
  {title: 'Avg. Rating', key: 'mean'},
  {title: 'Std. Dev.', key: 'std_dev'},
  {title: 'Rating Count', key: 'count'},
  {title: 'Distribution', key: 'distribution'},
];


export default class SurveyRatingSummaryReportComponent extends Component {
  @service house;

  constructor() {
    super(...arguments);

    const {report, summary} = this.args;
    const {type} = report;
    this.isNormal = (type === TYPE_NORMAL);
    this.isTrainer = (type === TYPE_TRAINER);

    if (this.isNormal) {
      this.ratings = summary.slots;
    } else if (this.isTrainer) {
      this.ratings = summary.trainers;
    }

    if (this.ratings) {
      this.ratings.forEach((r) => r.mean = r.mean.toFixed(1));
    }
  }

  @action
  exportRatingsSummary() {
    const columns = [...SUMMARY_COLUMNS];
    if (this.isNormal) {
      columns.unshift({title: 'Time', key: 'begins'})
      columns.unshift({title: 'Session', key: 'entity'})
    } else {
      columns.unshift({title: 'Trainer', key: 'entity'})
    }

    const rows = [];
    this.ratings.forEach((rating) => {
      const row = {
        'entity': this.isNormal ? rating.slot_description : rating.callsign,
        'mean': rating.mean,
        'std_dev': rating.variance,
        'count': rating.rating_count,
        'distribution': map(rating.distribution, (count, rank) => `${count}x${rank}`).join(' '),
      };

      if (this.isNormal) {
        row.begins = rating.slot_begins;
      }
      rows.push(row);
    });

    this.house.downloadCsv(`${this.args.survey.year}-${this.isNormal ? 'sessions' : 'trainer'}-ratings-summary.csv`, columns, rows);
  }
}
