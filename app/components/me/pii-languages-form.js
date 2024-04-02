import Component from '@glimmer/component';
import {service} from '@ember/service';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {validatePresence} from 'ember-changeset-validations/validators';
import validateCustom from "clubhouse/validators/custom";
import {LANGUAGE_CUSTOM, ProficiencyOptions} from "clubhouse/models/person-language";

export default class MePiiLanguagesFormComponent extends Component {
  @service ajax;
  @service house;
  @service modal;
  @service store;
  @service toast;

  @tracked isSubmitting = false;
  @tracked languageOptions = [];

  @tracked entry;

  validations = {
    language_name: [validatePresence({presence: true, message: 'Select a language'})],
    language_custom: [validateCustom({field: 'language_name'})]
  };

  proficiencyOptions = ProficiencyOptions;

  constructor() {
    super(...arguments);

    this._loadCommonOptions();
  }

  async _loadCommonOptions() {
    this.isSubmitting = true;
    try {
      const {languages} = await this.ajax.request('person-language/common-languages');
      this.commonLanguages = languages;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  newLanguage() {
    this.entry = this.store.createRecord('person-language', {person_id: this.args.person.id});
    this._setupOptions();
  }

  @action
  editLanguage(language) {
    this.entry = language;
    this._setupOptions();
  }

  _setupOptions() {
    const names = {};
    let options;
    if (this.entry.language_name === LANGUAGE_CUSTOM) {
      options = [...this.commonLanguages];
    } else {
      this.args.languages.forEach((l) => {
        if (this.entry.id === l.id) {
          return;
        }
        names[l.language_name] = true;
      });
      options = this.commonLanguages.filter((name) => !names[name]);
    }
    options.unshift(['--', '']);
    options.push(['Something Else', LANGUAGE_CUSTOM]);
    this.languageOptions = options;
  }

  @action
  cancelEdit() {
    this.entry = null;
  }

  @action
  async save(model, isValid) {
    if (!isValid) {
      return;
    }
    const {isNew} = this.entry;
    try {
      this.isSubmitting = true;
      await model.save();
      if (isNew) {
        this.args.languages.update();
      }
      this.toast.success(`The language was successfully ${isNew ? 'added' : 'updated'}.`);
      this.entry = null;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  deleteLanguage(language) {
    this.modal.confirm('Confirm Deletion', `Are you sure want to delete ${language.actualName}?`,
      async () => {
        try {
          this.isSubmitting = true;
          await language.destroyRecord();
          await this.args.languages.update();
          this.toast.success('The language has been deleted.');
        } catch (response) {
          this.house.handleErrorResponse(response);
        } finally {
          this.isSubmitting = false;
        }
      });
  }
}
