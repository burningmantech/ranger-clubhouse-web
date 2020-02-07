import Controller from '@ember/controller';
import EmberObject from '@ember/object';
import { later } from '@ember/runloop';
import { action, computed } from '@ember/object';
import { HandleConflict } from 'clubhouse/utils/handle-conflict';
import {
  AmericanSoundexRule,
  DoubleMetaphoneRule,
  EditDistanceRule,
  ExperimentalEyeRhymeRule,
  EyeRhymeRule,
  FccRule,
  MinLengthRule,
  PhoneticAlphabetRule,
  SubstringRule
} from 'clubhouse/utils/handle-rules';

let nextCheckId = 1;

class CheckedHandle extends EmberObject {
  // Lint suggests invalid change https://github.com/ember-cli/eslint-plugin-ember/issues/105
  // eslint-disable-next-line ember/use-brace-expansion
  @computed('allConflicts', 'controller.includeVintage', 'controller.{handleRules,entityTypes}.@each.enabled')
  get conflicts() {
    const enabledRules = new Set(this.controller.handleRules.filterBy('enabled').mapBy('id'));
    const enabledEntities = new Set(this.controller.entityTypes.filterBy('enabled').mapBy('name'));
    const vintage = this.controller.includeVintage;
    return this.allConflicts.filter((c) => {
      if (!enabledRules.has(c.ruleId)) {
        return false; // rule is disabled
      }
      if (c.conflictingHandle) {
        if (vintage && c.conflictingHandle.personVintage) {
          return true; // requested to show all vintage
        }
        if (!enabledEntities.has(c.conflictingHandle.entityType)) {
          return false; // entity type is disabled
        }
      }
      return true; // default case
    });
  }
}

export default class VcHandlerCheckerController extends Controller {
  currentName = '';
  includeVintage = true; // Check vintage even if status isn't checked
  checkedHandles = []; // Array of {id string, name string, conflicts HandleConflict[]}
  allHandles = []; // Same Handle objects as model

  constructor() {
    super(...arguments);
    this.addObserver('model', this.incrementallyBuildAllHandles);
  }

  /** Maps rule ID to {name string, rule object, enabled boolean} */
  @computed('model')
  get handleRules() {
    const handles = this.model.toArray();
    const rules = [];
    const addRule = (rule, name, enabled=true) => rules.pushObject(EmberObject.create({
      id: rule.id,
      name: name,
      rule: rule,
      enabled: enabled,
    }));
    // Rule ordering: Substring is first per 2019 request from Threepio.
    // No input yet on ideal ordering for all checks.
    addRule(new SubstringRule(handles), 'Substring');
    addRule(new MinLengthRule(), 'Minimum Length');
    addRule(new FccRule(), 'FCC naughty words');
    addRule(new PhoneticAlphabetRule(handles), 'Phonetic alphabet');
    addRule(new EditDistanceRule(handles), 'Edit distance');
    addRule(new AmericanSoundexRule(handles), 'American Soundex');
    addRule(new DoubleMetaphoneRule(handles), 'Double Metaphone');
    addRule(new EyeRhymeRule(handles), 'Eye rhymes');
    addRule(new ExperimentalEyeRhymeRule(handles), 'Experimental eye rhymes', false);
    return rules;
  }

  @computed('handleRules')
  get ruleNames() {
    return this.handleRules.reduce((names, rule) => {
      names[rule.id] = rule.name;
      return names;
    }, {});
  }

  @computed('model')
  get entityTypes() {
    const comparator = (entity1, entity2) => {
      // group all "$status ranger" statuses together
      const isRanger1 = entity1.indexOf('ranger') >= 0;
      const isRanger2 = entity2.indexOf('ranger') >= 0;
      if (isRanger1 !== isRanger2) {
        return isRanger2 - isRanger1;
      }
      return entity1.localeCompare(entity2);
    }
    // By default, alphas can choose the handle of a non-vintage retired Ranger
    const disabledByDefault = new Set(['retired ranger', 'non ranger ranger']);
    return this.model.mapBy('entityType').uniq().sort(comparator).map((type) => EmberObject.create({
      id: type.dasherize(),
      name: type,
      enabled: !disabledByDefault.has(type),
    }));
  }

  @computed('allHandles', 'entityTypes.@each.enabled', 'includeVintage')
  get allEnabledHandles() {
    const enabled = new Set(this.entityTypes.filterBy('enabled').mapBy('name'));
    const vintage = this.includeVintage;
    return this.allHandles
      .filter((handle) => (vintage && handle.personVintage) || enabled.has(handle.entityType));
  }

  _setAllHandlesBySlice(nextSize) {
    const model = this.model;
    this.set('allHandles', model.slice(0, nextSize));
    if (this.allHandles.length < model.length) {
      later(() => { this._setAllHandlesBySlice(nextSize + 200) }, 1);
    }
  }

  incrementallyBuildAllHandles() {
    // Rendering 2500 handles takes a long time, so don't prevent interactivity.
    // Copy 100 handles at a time into allHandles and let the template
    // incrementally render them.
    later(() => { this._setAllHandlesBySlice(200) }, 1);
  }

  /** Checks the currently-entered name against each rule and updates checkedHandles with the results. */
  @action
  checkCurrentName() {
    const name = this.currentName;
    const conflicts = [];
    const rules = Object.values(this.handleRules).map((obj) => obj.rule);
    const id = nextCheckId++;
    rules.map((rule) => conflicts.push(...rule.check(name)));
    conflicts.sort(HandleConflict.comparator);
    this.checkedHandles.unshiftObject(CheckedHandle.create({
      controller: this,
      id: id,
      name: name,
      allConflicts: conflicts,
    }));
    this.set('currentName', '');
  }

  /** Resets the list of checked handles. */
  @action
  clearCheckedHandles() {
    this.set('checkedHandles', []);
  }

  @action
  focusElement(element) {
    element.focus();
  }
}
