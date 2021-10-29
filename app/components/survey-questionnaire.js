import Component from '@glimmer/component';
import {validatePresence} from 'ember-changeset-validations/validators';
import EmberObject, {action} from '@ember/object';
import {htmlSafe} from '@ember/template';
import _ from 'lodash';
import {inject as service} from '@ember/service';
import {tracked} from '@glimmer/tracking';

export default class SurveyQuestionnaireComponent extends Component {
  @service house;
  @service ajax;
  @service session;
  @service toast;
  @tracked isSubmitting;

  ratingOptions = [
    {id: 1, title: '1 - Terrible!'},
    2,
    3,
    {id: 4, title: '4 - Ok / Neutral'},
    5,
    6,
    {id: 7, title: '7 - Fantastic!'}
  ];


  surveyForm = EmberObject.create({});
  validations = {};

  shareNameOptionsForTrainer = { };

  constructor() {
    super(...arguments);

    const survey = this.args.survey;
    const trainers = this.args.trainers;
    const groups = [];
    this.isTrainerSurvey = (survey.type === 'trainer');

    if (this.isTrainerSurvey) {
      // A trainer survey will loop through each trainer
      trainers.forEach((trainer) => {
        this.surveyForm['share_name_' + trainer.id] = 1;
        this.shareNameOptionsForTrainer[trainer.id] = [
          { id: 1, title: `Share my name with ${trainer.callsign}` },
          { id: 0, title: `Do not share my name with ${trainer.callsign}` }
        ];

        survey.survey_groups.forEach((group, idx) => {
          const trainerGroup = _.cloneDeep(group);
          trainerGroup.showTrainerPhoto = !idx;
          this._setupGroup(trainerGroup, trainer);
          groups.push(trainerGroup);
        });
      });
    } else {
      survey.survey_groups.forEach((group) => {
        if (group.type === 'trainer') {
          trainers.forEach((trainer) => {
            const trainerGroup = _.cloneDeep(group);
            trainerGroup.showTrainerPhoto = true;
            this._setupGroup(trainerGroup, trainer);
            groups.push(trainerGroup);
          });
        } else {
          const g = _.cloneDeep(group);
          this._setupGroup(g);
          groups.push(g);
        }
      });
    }

    this.surveyGroups = groups;
    if (survey.prologue) {
      this.htmlPrologue = htmlSafe(survey.prologue);
    }
  }

  _setupGroup(group, trainer = null) {
    if (trainer) {
      group.trainer = trainer;
    }

    group.survey_questions.forEach((q) => {
      let formName = `question_${q.id}`;
      if (trainer) {
        formName += `_${trainer.id}`;
      }

      q.formName = formName;
      this.surveyForm[formName] = '';
      if (q.is_required) {
        this.validations[q.formName] = validatePresence({presence: true, message: 'Please answer the question.'});
      }

      if (q.type === 'options') {
        q.formOptions = q.options.trim().split("\n");
        this.surveyForm[formName] = '';
      }
    });
  }

  @action
  submitAction(model, isValid) {
    if (!isValid) {
      this.house.scrollToElement('.is-invalid');
      return;
    }

    this.isSubmitting = true;

    const survey = this.args.survey;

    const groups = this.surveyGroups.map((group) => {
      const answerGroup = {
        survey_group_id: group.id,
      };

      if (group.trainer || this.isTrainerSurvey) {
        answerGroup.trainer_id = group.trainer.id;

        if (this.isTrainerSurvey) {
          answerGroup.can_share_name = model['share_name_'+group.trainer.id] == 1;
        }
      }

      answerGroup.answers = group.survey_questions.map((q) => {
        return {
          survey_question_id: q.id,
          response: model[q.formName],
        };
       });

      return answerGroup;
    });

    this.ajax.request(`survey/submit`, {
      method: 'POST',
      data: {
        survey: groups,
        slot_id: this.args.slot.id,
        type: survey.type,
      }
    }).then(() => {
      this.toast.success('Your responses have been successfully saved. Thank you!');
      this.args.onDone();
    }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false);
  }
}

