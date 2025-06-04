import Component from '@glimmer/component';
import {
  TYPE_ALPHA,
  TYPE_MENTEES_FOR_MENTOR,
  TYPE_MENTOR_FOR_MENTEES,
  TYPE_TRAINER,
  TypeLabels
} from "clubhouse/models/survey";
import {TYPE_RATING} from "clubhouse/models/survey-question";
import {service} from '@ember/service';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import _ from 'lodash';
import {ALPHA} from "clubhouse/constants/positions";

const TRAINEE_ON_TRAINER_CSV = [
  {title: 'Session', key: 'begins'},
  {title: 'Description', key: 'description'},
  {title: 'Trainer', key: 'trainer_callsign'},
  {title: 'Respondent', key: 'trainee_callsign'},
];

export default class SurveyReport extends Component {
  @service ajax;
  @service house;

  @tracked isLoading = false;
  @tracked reports;
  @tracked report;

  @tracked trainerTitle;

  @tracked survey;
  @tracked trainers;
  @tracked people;

  @tracked haveOverallRatings = false;

  constructor() {
    super(...arguments);

    this.training = this.args.training;
    this.#loadReport();
  }


  async #loadReport() {
    let {surveyId, reportId} = this.args;

    if (!isNaN(reportId)) {
      reportId = +reportId;
    }

    try {
      this.isLoading = true;
      this.survey = (await this.ajax.request(`survey/${surveyId}`)).survey;
      if (this.survey.type === TYPE_TRAINER) {
        this.trainers = (await this.ajax.request(`survey/${surveyId}/all-trainers-report`)).trainers;
        this.people = this.trainers;
        this.haveOverallRatings = this.people.find((p) => p.report.questions?.find((q) => q.type === TYPE_RATING));
      } else {
        this.reports = (await this.ajax.request(`survey/${surveyId}/report`)).reports;
        this.report = this.reports.find((r) => r.id === reportId);
      }

      this.questions = (await this.ajax.request(`survey-question`, {data: {survey_id: surveyId}})).survey_question;

      switch (this.survey.type) {
        case TYPE_MENTEES_FOR_MENTOR:
          this.trainerTitle = 'Mentor';
          break;
        case TYPE_MENTOR_FOR_MENTEES:
          this.trainerTitle = 'Mentee';
          break;
        default:
          this.trainerTitle = (this.survey.position_id === ALPHA ? 'Mentor' : 'Trainer');
          break;
      }

    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isLoading = false;
    }
  }

  @action
  exportTrainersFeedback() {
    const responses = {};
    const foundQuestions = {};

    this.people.forEach((trainer) => {
      trainer.report.questions?.forEach((q) => {
        if (q.type === TYPE_RATING) {
          return;
        }
        q.slots?.forEach((s) => {
          s.responses?.forEach((r) => {
            const {person} = r;
            const row = (responses[`s${s.slot_id}_t${trainer.id}_${person.id}`] ||= {
              begins: s.slot_begins,
              description: s.slot_description,
              trainer_callsign: trainer.callsign,
              trainee_callsign: person.callsign,
            });
            foundQuestions[q.id] = true;
            row[`q_${q.id}`] = r.answer;
          });
        })
      });
    })

    const columns = [...TRAINEE_ON_TRAINER_CSV];
    const rows = Object.values(responses);

    rows.sort((a, b) => {
      const dateCmp = a.begins.localeCompare(b.begins);
      if (dateCmp) {
        return dateCmp;
      }

      const trainer = a.trainer_callsign.localeCompare(b.trainer_callsign);
      if (trainer) {
        return trainer;
      }

      return a.trainee_callsign.localeCompare(b.trainee_callsign);
    });

    this.questions.forEach((q) => {
      if (!foundQuestions[q.id] || q.type === TYPE_RATING) {
        return;
      }
      columns.push({title: q.description, key: `q_${q.id}`});
    });


    this.house.downloadCsv(`${this.survey.year}-${TypeLabels[this.survey.type].replace(/ /g, '-')}-feedback.csv`, columns, rows);
  }

  @action
  exportTrainerRatings() {
    const responses = {};
    const foundQuestions = {};

    this.people.forEach((trainer) => {
      trainer.report.questions?.forEach((q) => {
        if (q.type !== TYPE_RATING) {
          return;
        }

        foundQuestions[q.id] = true;

        const row = (responses[trainer.id] ||= {
          callsign: trainer.callsign,
        });

        row[`${q.id}_mean`] = q.mean;
        row[`${q.id}_std_dev`] = ((q.mean / 7.0) / 100.0).toFixed(2);
        row[`${q.id}_variance`] = q.variance;
        row[`${q.id}_rating_count`] = q.rating_count;
        row[`${q.id}_distribution`] = _.map(q.distribution, (rank, count) => `${rank}x${count}`).join(' ');
      })
    });

    const columns = [{title: 'Trainer', key: 'callsign'}];

    this.questions.forEach((q) => {
      if (!foundQuestions[q.id] || q.type !== TYPE_RATING) {
        return;
      }

      columns.push({title: `${q.description} Mean`, key: `${q.id}_mean`});
      columns.push({title: 'Std. Dev.', key: `${q.id}_std_dev`});
      columns.push({title: 'Variance', key: `${q.id}_variance`});
      columns.push({title: 'Rating Count', key: `${q.id}_rating_count`});
      columns.push({title: 'Distribution', key: `${q.id}_distribution`});
    })

    const rows = Object.values(responses);
    this.house.downloadCsv(`${this.survey.year}-${TypeLabels[this.survey.type].replace(/ /g, '-')}-ratings.csv`, columns, rows);
  }

  @action
  exportTraineeFeedback() {
    if (this.survey.type === TYPE_ALPHA) {
      this.exportDirtMentors();
      return;
    }

    const responses = {};
    const foundQuestions = {};

    this.report.trainers.forEach((trainer) => {
      trainer.questions?.forEach((q) => {
        if (q.type === TYPE_RATING) {
          return;
        }
        q.slots?.forEach((s) => {
          s.responses?.forEach((r) => {
            const {person} = r;
            const row = (responses[`s${s.slot_id}_t${trainer.id}_${person.id}`] ||= {
              begins: s.slot_begins,
              description: s.slot_description,
              trainer_callsign: trainer.callsign,
              trainee_callsign: person.callsign,
            });
            foundQuestions[q.id] = true;
            row[`q_${q.id}`] = r.answer;
          });
        })
      });
    })

    const columns = [...TRAINEE_ON_TRAINER_CSV];
    const rows = Object.values(responses);

    rows.sort((a, b) => {
      const dateCmp = a.begins.localeCompare(b.begins);
      if (dateCmp) {
        return dateCmp;
      }

      return a.trainer_callsign.localeCompare(b.trainer_callsign);
    });

    this.questions.forEach((q) => {
      if (!foundQuestions[q.id] || q.type === TYPE_RATING) {
        return;
      }
      columns.push({title: q.description, key: `q_${q.id}`});
    });


    this.house.downloadCsv(`${this.survey.year}-${TypeLabels[this.survey.type].replace(/ /g, '-')}-feedback.csv`, columns, rows);
  }


  @action
  exportDirtMentors() {
    const responses = {};
    const foundQuestions = {};

    this.report.trainers.forEach((mentor) => {
      mentor.questions?.forEach((q) => {
        if (q.type === TYPE_RATING) {
          return;
        }
        q.responses?.forEach((r) => {
          const {person} = r;
          const row = (responses[`${mentor.id}_${person.id}`] ||= {
            mentor_callsign: mentor.callsign,
            alpha_callsign: person.callsign,
          });
          foundQuestions[q.id] = true;
          row[`q_${q.id}`] = r.answer;
        });
      })
    });

    const columns = [
      {title: 'Mentor', key: 'mentor_callsign'},
      {title: 'Alpha', key: 'alpha_callsign'}
    ];
    const rows = Object.values(responses);

    rows.sort((a, b) => {
      const cmp = a.mentor_callsign.localeCompare(b.mentor_callsign);
      if (cmp) {
        return cmp;
      }

      return a.alpha_callsign.localeCompare(b.alpha_callsign);
    });

    this.questions.forEach((q) => {
      if (!foundQuestions[q.id] || q.type === TYPE_RATING) {
        return;
      }
      columns.push({title: q.description, key: `q_${q.id}`});
    });


    this.house.downloadCsv(`${this.survey.year}-${TypeLabels[this.survey.type].replace(/ /g, '-')}-feedback.csv`, columns, rows);
  }

  @action
  exportGeneralFeedback() {
    const responses = {};
    const foundQuestions = {};

    if (this.survey.type === TYPE_ALPHA) {
      this.exportAlphaGeneralFeedback();
      return;
    }

    this.report.questions.forEach((q) => {
      if (q.type === TYPE_RATING) {
        return;
      }
      q.slots?.forEach((s) => {
        s.responses?.forEach((r) => {
          const {person} = r;
          const row = (responses[`s${s.slot_id}_${person.id}`] ||= {
            begins: s.slot_begins,
            description: s.slot_description,
            trainee_callsign: person.callsign,
          });
          foundQuestions[q.id] = true;
          row[`q_${q.id}`] = r.answer;
        });
      });
    });

    const columns = [
      {title: 'Session', key: 'begins'},
      {title: 'Description', key: 'description'},
      {title: 'Respondent', key: 'trainee_callsign'},
    ];

    const rows = Object.values(responses);

    rows.sort((a, b) => {
      const dateCmp = a.begins.localeCompare(b.begins);
      if (dateCmp) {
        return dateCmp;
      }

      const trainer = a.trainer_callsign.localeCompare(b.trainer_callsign);
      if (trainer) {
        return trainer;
      }

      return a.trainee_callsign.localeCompare(b.trainee_callsign);
    });

    this.questions.forEach((q) => {
      if (!foundQuestions[q.id] || q.type === TYPE_RATING) {
        return;
      }
      columns.push({title: q.description, key: `q_${q.id}`});
    });


    this.house.downloadCsv(`${this.survey.year}-${TypeLabels[this.survey.type].replace(/ /g, '-')}-feedback.csv`, columns, rows);
  }

  @action
  exportAlphaGeneralFeedback() {
    const responses = {};
    const foundQuestions = {};

    this.report.questions.forEach((q) => {
      if (q.type === TYPE_RATING) {
        return;
      }
      q.responses?.forEach((r) => {
        const {person} = r;
        const row = (responses[person.id] ||= {
          callsign: person.callsign,
        });
        foundQuestions[q.id] = true;
        row[`q_${q.id}`] = r.answer;
      });
    });

    const columns = [
      {title: 'Alpha', key: 'callsign'},
    ];

    const rows = Object.values(responses);

    rows.sort((a, b) => a.callsign.localeCompare(b.callsign));

    this.questions.forEach((q) => {
      if (!foundQuestions[q.id] || q.type === TYPE_RATING) {
        return;
      }
      columns.push({title: q.description, key: `q_${q.id}`});
    });


    this.house.downloadCsv(`${this.survey.year}-${TypeLabels[this.survey.type].replace(/ /g, '-')}-feedback.csv`, columns, rows);
  }
}
