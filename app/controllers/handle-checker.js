import Controller from '@ember/controller';
import EmberObject, { computed, observer } from '@ember/object';
import { HandleConflict } from '../utils/handle-conflict';
import {
  AmericanSoundexRule,
  DoubleMetaphoneRule,
  EditDistanceRule,
  EyeRhymeRule,
  FccRule,
  MinLengthRule,
  PhoneticAlphabetRule,
  SubstringRule
} from '../utils/handle-rules';

let nextCheckId = 1;

const CheckedHandle = EmberObject.extend({
  // Lint suggests invalid change https://github.com/ember-cli/eslint-plugin-ember/issues/105
  // eslint-disable-next-line ember/use-brace-expansion
  conflicts: computed('allConflicts', 'controller.includeVintage', 'controller.{handleRules,entityTypes}.@each.enabled', function() {
    const enabledRules = new Set(this.get('controller.handleRules').filterBy('enabled').mapBy('id'));
    const enabledEntities = new Set(this.get('controller.entityTypes').filterBy('enabled').mapBy('name'));
    const vintage = this.get('controller.includeVintage');
    return this.get('allConflicts').filter((c) => {
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
  }),
});

export default Controller.extend({
  currentName: '',
  includeVintage: true, // Check vintage even if status isn't checked

  init() {
    this._super(...arguments);
    this.set('checkedHandles', []); // Array of {id string, name string, conflicts HandleConflict[]}
    this.set('allHandles', []); // Same Handle objects as model
  },

  /** Maps rule ID to {name string, rule object, enabled boolean} */
  handleRules: computed('model', function() {
    const handles = this.model.toArray();
    const rules = [];
    const addRule = (rule, name) => rules.pushObject(EmberObject.create({
      id: rule.id,
      name: name,
      rule: rule,
      enabled: true,
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
    return rules;
  }),

  ruleNames: computed('handleRules', function() {
    return this.get('handleRules').reduce((names, rule) => {
      names[rule.id] = rule.name;
      return names;
    }, {});
  }),

  entityTypes: computed('model', function() {
    const comparator = (entity1, entity2) => {
      // group all "$status ranger" statuses together
      const isRanger1 = entity1.indexOf('ranger') >= 0;
      const isRanger2 = entity2.indexOf('ranger') >= 0;
      if (isRanger1 !== isRanger2) {
        return isRanger2 - isRanger1;
      }
      return entity1.localeCompare(entity2);
    }
    return this.get('model').mapBy('entityType').uniq().sort(comparator).map((type) => EmberObject.create({
      id: type.dasherize(),
      name: type,
      enabled: true,
    }));
  }),

  allEnabledHandles: computed('allHandles', 'entityTypes.@each.enabled', 'includeVintage', function() {
    const enabled = new Set(this.get('entityTypes').filterBy('enabled').mapBy('name'));
    const vintage = this.get('includeVintage');
    return this.get('allHandles')
      .filter((handle) => (vintage && handle.personVintage) || enabled.has(handle.entityType));
  }),

  incrementallyBuildAllHandles: observer('model', function() { // eslint-disable-line ember/no-observers
    // Rendering 2500 handles takes a long time, so don't prevent interactivity.
    // Copy 100 handles at a time into allHandles and let the template
    // incrementally render them.  TODO there's probably a cleaner approach.
    let nextSize = 100;
    let incrementallyAdd = () => {
      let model = this.get('model');
      this.set('allHandles', model.slice(0, nextSize));
      if (this.get('allHandles').length < model.length) {
        nextSize += 100;
        setTimeout(incrementallyAdd, 0);
      }
    };
    setTimeout(incrementallyAdd, 0);
  }),

  actions: {
    /** Checks the currently-entered name against each rule and updates checkedHandles with the results. */
    checkCurrentName() {
      const name = this.currentName;
      const conflicts = [];
      const rules = Object.values(this.handleRules).map((obj) => obj.rule);
      const id = nextCheckId++;
      rules.map((rule) => conflicts.push(...rule.check(name)));
      conflicts.sort(HandleConflict.comparator);
      this.get('checkedHandles').unshiftObject(CheckedHandle.create({
        controller: this,
        id: id,
        name: name,
        allConflicts: conflicts,
      }));
      this.set('currentName', '');
    },

    /** Resets the list of checked handles. */
    clearCheckedHandles() {
      this.set('checkedHandles', []);
    },
  },

});
