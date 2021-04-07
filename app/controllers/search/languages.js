import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {debounce} from '@ember/runloop';
import {action, set} from '@ember/object';
import {tracked} from '@glimmer/tracking';

const SEARCH_RATE_MS = 500;

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

export default class SearchLanguagesController extends ClubhouseController {
  @tracked notFound = '';
  @tracked searchLanguage = '';

  @tracked onDuty = [];
  @tracked offDuty = [];
  @tracked hasRadio = [];

  @tracked searchForm = null;

  @tracked isLoading = false;

  get onDutyGroup() {
    return groupBy(this.onDuty, 'language_name')
  }

  get offDutyGroup() {
    return groupBy(this.offDuty, 'language_name');
  }

  get hasRadioGroup() {
    return groupBy(this.hasRadio, 'language_name');
  }

  // Build up a request and fire off a search
  _performSearch() {
    if (this.isLoading) {
      return; // in progress
    }

    const language = this.searchForm.language.trim();

    // bail out if query is empty
    if (language === '') {
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
      if (response.status === 404) {
        this.notFound = language;
      } else {
        this.house.handleErrorResponse(response);
      }
    }).finally(() => this.isLoading = false);
  }

  @action
  languageUpdate(field, model) {
    // Delay the search if a name if being typed
    debounce(this, this._performSearch, model, SEARCH_RATE_MS);
  }

  @action
  onSiteUpdate(field, model) {
    this._performSearch(model);
  }

  @action
  submit(model) {
    this._performSearch(model);
  }

  @action
  setLanguage(language) {
    set(this.searchForm, 'language', language);
    this._performSearch();
  }
}
