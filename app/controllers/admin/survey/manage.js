import Controller from '@ember/controller';
import {action, set} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class AdminSurveyManageController extends Controller {
  @tracked groupEntry = null;
  @tracked questionEntry = null;

  @tracked survey;
  @tracked surveyGroups;
  @tracked surveyQuestions;

  @tracked surveyEdit;

  @tracked orderedGroups;

  typeOptions = [
    {id: 'rank', title: 'Rating 1 to 7'},
    {id: 'text', title: 'Text Response'},
    {id: 'options', title: 'Options'}
  ];

  codeOptions = [
    {
      groupName: "Student Survey",
      options: [
        {id: '', title: 'select a code'},
        {id: 'art', title: 'art: ART feedback (text)'},
        {id: 'manual_comments', title: 'manual_comments: Feedback about the Ranger Manual (text)'},
        {id: 'manual_rating', title: 'manual_rating: Ranger Manual Rating (rating)'},
        {id: 'manual_use', title: 'manual_use: How was the Ranger Manual used in training? (text)'},
        {id: 'other', title: 'other: Any other comments about training (text)'},
        {id: 'suggestion', title: 'suggestion: Comments to better Ranger training (text)'},
        {id: 'training_best', title: 'training_best: Comments on training best parts (text)'},
        {id: 'training_less', title: 'training_less: Comments on want to see less of (text)'},
        {id: 'training_more', title: 'training_more: Comments on what to see more of (text)'},
        {id: 'training_rating', title: 'training_rating: Overall training rating'},
        {id: 'training_worst', title: 'training_worst: Comments on worst parts (text)'},
        {id: 'venue_comments', title: 'venue_comments: Venue comments (text)'},
        {id: 'venue_rating', title: 'venue_rating: Overall Venue rating'},
      ]
    },
    {
      groupName: "Student Survey Trainer Subsection",
      options: [
        {id: 'trainer_comment', title: 'trainer_comment: Student comments for Trainer (text)'},
        {id: 'trainer_rating', title: 'trainer_rating: Trainer overall rating'},
      ]
    },

    {
      groupName: "Trainer-for-Trainer Survey",
      options: [
        {id: 'bad', title: 'bad: Concerns about trainer (text)'},
        {id: 'good', title: 'good: What trainer did well (text)',},
        {id: 'gavefb', title: 'gavefb: Was feedback delivered to trainer (option)'},
        {id: 'didntgivefb_why', title: 'didntgivefb_why: Reason why feedback was not delivered (text)'},
        {
          id: 'followcurriculum_rating',
          title: 'followcurriculum_rating: Trainer\'s ability to follow the curriculum (text)'
        },
        {id: 'nam_rating', title: 'nam_rating: How well did the trainer not make it about themselves (rating)'},
        {id: 'ontime_rating', title: 'ontime_rating: Trainer stayed on time (rating)'},
        {
          id: 'confidential_comments',
          title: 'confidential_comments: Parting thoughts about Trainer (text, T.A. only see answers)'
        },
        {id: 'overall_rating', title: 'overall_raing: Overall effectiveness on training delivery (rating)'},
        {id: 'preparedness_rating', title: 'preparedness_rating: Trainer preparations (rating)'},
        {id: 'suggestions', title: 'suggestions: Trainer improvement suggestions (text)'},
        {id: 'tit_demonstrate', title: 'tit_demonstrate: Assoc. Trainer improvement comments (text)'},
        {id: 'tit_graduate', title: 'tit_graduate: Is Assoc. Trainer ready to graduate (options)'},
      ]
    },
    {
      groupName: "Deprecated codes",
      options: [
        {id: 'rude_comments', title: 'rude_comments:  RUdE (Refresh, Update, Enhance) comments (text)'},
        {id: 'rude_rating', title: 'rude_rating: RuDE overall effectiveness (rating)'},
      ]
    }
  ];

  _buildOrderedGroups() {
    this.orderedGroups = this.surveyGroups.sortBy('sort_index');
  }

  @action
  newGroupAction() {
    const lastGroup = this.surveyGroups.lastObject;

    this.groupEntry = this.store.createRecord('survey-group', {
      survey_id: this.survey.id,
      sort_index: lastGroup ? lastGroup.sort_index + 1 : 1,
      is_trainer_group: false
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
  deleteGroupAction(group) {
    this.modal.confirm('Confirm Question Delete', 'By deleting this question, all respondent answers will be lost. Are you sure want to delete this question?',
      () => {
        group.destroyRecord().then(async () => {
          this.toast.success('The question has been deleted.');
          await this.surveyGroups.update();
          await this.surveyQuestions.update();
          this._assignQuestions();
          this._buildOrderedGroups()
        })
      });
  }

  @action
  async moveGroupAction(group, direction) {
    let groups = this.orderedGroups;
    const idx = groups.findIndex((g) => g.id == group.id);

    groups.removeObject(group);

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
    const lastQuestion = group.surveyQuestions ? group.surveyQuestions.lastObject : null;

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
  deleteQuestionAction(question) {
    this.modal.confirm('Confirm Question Delete', 'By deleting this question, all respondent answers will be lost. Are you sure want to delete this question?',
      () => {
        question.destroyRecord().then(() => {
          this.toast.success('The question has been deleted.');
          this.surveyQuestions.update().then(() => {
            this._assignQuestions();
          })
        })
      });
  }

  @action
  saveQuestionAction(model, isValid) {
    if (!isValid) {
      return;
    }

    const isNew = model.isNew;

    model.save().then(() => {
      this.toast.success(`The survey question was successfully ${isNew ? 'created' : 'updated'}.`);
      this.questionEntry = null;
      if (isNew) {
        this.surveyQuestions.update().then(() => {
          this._assignQuestions();
        });
      } else {
        this._assignQuestions();
      }
    }).catch((response) => this.house.handleErrorResponse(response, model));
  }

  @action
  async moveQuestionAction(group, question, direction, event) {
    event.preventDefault();
    const idx = group.surveyQuestions.findIndex((q) => q.id == question.id);
    let questions = group.surveyQuestions.toArray().filter((q) => q.id != question.id);

    if (direction < 0) {
      if (idx == 1) {
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
      if (q.sort_index != sortIdx) {
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
      set(group, 'surveyQuestions', this.surveyQuestions.filter((q) => (q.survey_group_id == group.id)).sort((a, b) => a.sort_index - b.sort_index));
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
}
