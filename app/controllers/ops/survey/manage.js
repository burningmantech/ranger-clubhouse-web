import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action, set} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {TYPE_NORMAL, TYPE_TRAINER, TYPE_SEPARATE, TYPE_SUMMARY} from 'clubhouse/models/survey-group';
import _ from 'lodash';
import {htmlSafe} from '@ember/template';

export default class OpsSurveyManageController extends ClubhouseController {
  @tracked groupEntry = null;
  @tracked questionEntry = null;
  @tracked survey;
  @tracked surveyGroups;
  @tracked surveyQuestions;
  @tracked surveyEdit;
  @tracked orderedGroups;

  typeOptions = [
    {id: 'rating', title: 'Rating 1 to 7'},
    {id: 'text', title: 'Text Response'},
    {id: 'options', title: 'Options'}
  ];

  groupTypeOptions = [
    {id: TYPE_NORMAL, title: 'Normal: Group questions are on the main report'},
    {
      id: TYPE_TRAINER,
      title: 'Trainer/Mentor: Group questions are repeated for each trainer/mentor who taught. Responses are collated on the Trainers\' Report'
    },
    {id: TYPE_SEPARATE, title: 'Separate: Group is a separate report with session breakdown (report title req.)'},
    {id: TYPE_SUMMARY, title: 'Summary: Group is a separate report with NO session breakdown (report title req.)'},
  ]


  _buildOrderedGroups() {
    this.orderedGroups = _.sortBy(this.surveyGroups, 'sort_index');
  }

  @action
  safeHtmlString(string) {
    return htmlSafe(string);
  }

  @action
  newGroupAction() {
    const lastGroup = _.last(this.surveyGroups);

    this.groupEntry = this.store.createRecord('survey-group', {
      survey_id: this.survey.id,
      sort_index: lastGroup ? lastGroup.sort_index + 1 : 1,
      type: TYPE_NORMAL,
      active: false
    });
  }

  @action
  editGroupAction(group) {
    this.groupEntry = group;
  }

  @action
  cancelGroupAction() {
    this.groupEntry = null;
  }

  @action
  saveGroupAction(model, isValid) {
    if (!isValid) {
      return;
    }

    const isNew = model.isNew;

    model.save().then(() => {
      this.toast.success(`The survey group was successfully ${isNew ? 'created' : 'updated'}.`);
      this.groupEntry = null;
      if (isNew) {
        this.surveyGroups.update().then(() => this._buildOrderedGroups());
      }
    }).catch((response) => this.house.handleErrorResponse(response, model));
  }

  @action
  deleteGroupAction() {
    this.modal.confirm('Confirm Group Delete',
      'By deleting this group, all respondent answers will be lost. Are you sure want to delete this question?',
      async () => {
        try {
          await this.groupEntry.destroyRecord();
          this.toast.success('The group has been deleted.');
          this.groupEntry = null;
          await this.surveyGroups.update();
          await this.surveyQuestions.update();
          this._assignQuestions();
          this._buildOrderedGroups()
        } catch (response) {
          this.house.handleErrorResponse(response);
        }
      });
  }

  @action
  async moveGroupAction(group, direction) {
    let groups = this.orderedGroups;
    const idx = groups.findIndex((g) => g.id == group.id);

    _.pull(groups, group);

    if (direction < 0) {
      if (idx === 1) {
        groups.unshift(group);
      } else if (idx > 0) {
        groups.splice(idx - 1, 0, group);
      }
    } else {
      if (idx < (groups.length - 1)) {
        groups.splice(idx + 1, 0, group);
      } else {
        groups.push(group);
      }
    }

    for (let idx = 0; idx < groups.length; idx++) {
      const g = groups[idx];
      const sortIdx = idx + 1;
      if (sortIdx !== g.sort_index) {
        g.sort_index = sortIdx;
        try {
          await g.save();
        } catch (response) {
          this.house.handleErrorResponse(response);
        }
      }
    }
    this._buildOrderedGroups();
    this.toast.success('Group order successfully updated.');
  }


  @action
  newQuestionAction(group) {
    const lastQuestion = group.surveyQuestions ? _.last(group.surveyQuestions) : null;

    this.questionEntry = this.store.createRecord('survey-question', {
      survey_id: this.survey.id,
      survey_group_id: group.id,
      sort_index: lastQuestion ? lastQuestion.sort_index + 1 : 1,
      type: 'text',
      is_required: false
    });
  }

  @action
  editQuestionAction(group) {
    this.questionEntry = group;
  }

  @action
  cancelQuestionAction() {
    this.questionEntry = null;
  }

  @action
  deleteQuestionAction() {
    this.modal.confirm('Confirm Question Delete', 'By deleting this question, all respondent answers will be lost. Are you sure want to delete this question?',
      async () => {
        try {
          await this.questionEntry.destroyRecord();
          this.toast.success('The question has been deleted.');
          this.questionEntry = null;
          await this.surveyQuestions.update();
          this._assignQuestions();
        } catch (response) {
          this.house.handleErrorResponse(response);
        }
      });
  }

  @action
  async saveQuestionAction(model, isValid) {
    if (!isValid) {
      return;
    }

    const isNew = model.isNew;

    try {
      await model.save();
      this.toast.success(`The survey question was successfully ${isNew ? 'created' : 'updated'}.`);
      this.questionEntry = null;
      if (isNew) {
        await this.surveyQuestions.update();
      }
      this._assignQuestions();
    } catch (response) {
      this.house.handleErrorResponse(response, model)
    }
  }

  @action
  async moveQuestionAction(group, question, direction) {
    const idx = group.surveyQuestions.findIndex((q) => q.id == question.id);
    let questions = group.surveyQuestions.toArray().filter((q) => q.id != question.id);

    if (direction < 0) {
      if (idx === 1) {
        questions.unshift(question);
      } else if (idx > 0) {
        questions.splice(idx - 1, 0, question);
      }
    } else {
      if (idx < (questions.length - 1)) {
        questions.splice(idx + 1, 0, question);
      } else {
        questions.push(question);
      }
    }

    for (let i = 0; i < questions.length; i++) {
      const sortIdx = i + 1;
      const q = questions[i];
      if (q.sort_index !== sortIdx) {
        q.sort_index = sortIdx;
        try {
          await q.save();
        } catch (response) {
          this.house.handleErrorResponse(response);
        }
      }
    }

    this.toast.success('Question order successfully updated.');
    this._assignQuestions();
  }

  _assignQuestions() {
    this.surveyGroups.forEach((group) => {
      set(group, 'surveyQuestions',
        this.surveyQuestions.filter((q) => (q.survey_group_id == group.id))
          .sort((a, b) => a.sort_index - b.sort_index));
    });
  }

  @action
  editSurveyAction() {
    this.surveyEdit = this.survey;
  }

  @action
  cancelSurveyAction() {
    this.surveyEdit = null;
  }

  @action
  saveSurveyAction() {
    this.surveyEdit = null;
  }

  isNotLast(obj, array) {
    return obj !== array[array.length - 1];
  }
}
