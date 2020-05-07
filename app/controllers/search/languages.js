import Controller from '@ember/controller';
import {debounce} from '@ember/runloop';
import EmberObject, {action, computed} from '@ember/object';
import {tracked} from '@glimmer/tracking';

const SEARCH_RATE_MS = 350;

const groupBy = function (items, key) {
  const groups = [];

  if (items == null) {
    return groups;
  }

  items.forEach((item) => {
    const value = item[key];
    let group = groups.findBy(key, value);

    if (group) {
      group.items.push(item);
    } else {
      groups.push({[key]: value, items: [item]});
    }
  });

  return groups;
}

export default class SearchLanguagesController extends Controller {
  @tracked notFound = '';
  @tracked searchLanguage = '';

  @tracked onDuty = [];
  @tracked offDuty = [];
  @tracked hasRadio = [];

  searchForm = EmberObject.create({
    language: '',
    offSite: false
  });

  @computed('onDuty')
  get onDutyGroup() {
    return groupBy(this.onDuty, 'language_name')
  }

  @computed('offDuty')
  get offDutyGroup() {
    return groupBy(this.offDuty, 'language_name');
  }

  @computed('hasRadio')
  get hasRadioGroup() {
    return groupBy(this.hasRadio, 'language_name');
  }

  // Build up a request and fire off a search
  _performSearch() {
    const language = this.searchForm.language.trim();

    // bail out if query is empty
    if (language == '') {
      return;
    }

    const params = {language};

    if (this.searchForm.offSite) {
      params.off_site = 1;
    }

    this.searchLanguage = language;
    this.isLoading = true;
    this.ajax.request('language/speakers', {data: params})
      .then((results) => {
        this.onDuty = results.on_duty;
        this.offDuty = results.off_duty;
        this.hasRadio = results.has_radio;
      }).catch((response) => {
      if (response.status == 404) {
        this.notFound = language;
      } else {
        this.house.handleErrorResponse(response);
      }
    }).finally(() => this.isSubmitting = false);
  }

  @action
  searchOnChange(field, model) {
    if (field.name == 'language') {
      // Delay the search if a name if being typed
      debounce(this, this._performSearch, model, SEARCH_RATE_MS);
    } else {
      // Otherwise, run the search immediately.
      this._performSearch(model);
    }
  }

  @action
  setLanguage(language) {
    this.searchForm.set('language', language);
    this._performSearch();
  }
}
