import {
  ALL_RULE_CLASSES,
  AmericanSoundexRule,
  DoubleMetaphoneRule,
  EditDistanceRule,
  // TODO test ExperimentalEyeRhymeRule
  EyeRhymeRule,
  MinLengthRule,
  PhoneticAlphabetRule,
  SubstringRule,
} from 'clubhouse/utils/handle-rules';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {TYPE_PHONETIC_ALPHABET, TYPE_UNCATEGORIZED} from "clubhouse/models/handle-reservation";

module('Unit | Utility | handle-rules', function(hooks) {
  setupTest(hooks);

  const natoHandles = [
    {name: 'Alfa', entityType: TYPE_PHONETIC_ALPHABET},
    {name: 'Bravo', entityType: TYPE_PHONETIC_ALPHABET},
    {name: 'Charlie', entityType: TYPE_PHONETIC_ALPHABET},
    {name: 'Delta', entityType: TYPE_PHONETIC_ALPHABET},
    {name: 'Echo', entityType: TYPE_PHONETIC_ALPHABET},
    {name: 'Foxtrot', entityType: TYPE_PHONETIC_ALPHABET},
    {name: 'Golf', entityType: TYPE_PHONETIC_ALPHABET},
    {name: 'Hotel', entityType: TYPE_PHONETIC_ALPHABET},
    {name: 'India', entityType: TYPE_PHONETIC_ALPHABET},
    {name: 'Juliett', entityType: TYPE_PHONETIC_ALPHABET},
    {name: 'Kilo', entityType: TYPE_PHONETIC_ALPHABET},
    {name: 'Lima', entityType: TYPE_PHONETIC_ALPHABET},
    {name: 'Mike', entityType: TYPE_PHONETIC_ALPHABET},
    {name: 'November', entityType: TYPE_PHONETIC_ALPHABET},
    {name: 'Oscar', entityType: TYPE_PHONETIC_ALPHABET},
    {name: 'Papa', entityType: TYPE_PHONETIC_ALPHABET},
    {name: 'Quebec', entityType: TYPE_PHONETIC_ALPHABET},
    {name: 'Romeo', entityType: TYPE_PHONETIC_ALPHABET},
    {name: 'Sierra', entityType: TYPE_PHONETIC_ALPHABET},
    {name: 'Tango', entityType: TYPE_PHONETIC_ALPHABET},
    {name: 'Uniform', entityType: TYPE_PHONETIC_ALPHABET},
    {name: 'Victor', entityType: TYPE_PHONETIC_ALPHABET},
    {name: 'Whiskey', entityType: TYPE_PHONETIC_ALPHABET},
    {name: 'X-ray', entityType: TYPE_PHONETIC_ALPHABET},
    {name: 'Yankee', entityType: TYPE_PHONETIC_ALPHABET},
    {name: 'Zulu', entityType: TYPE_PHONETIC_ALPHABET},
  ];

  const wordHandles = [
    {name: 'Alfa', entityType: TYPE_UNCATEGORIZED},
    {name: 'Bravo', entityType: TYPE_UNCATEGORIZED},
    {name: 'Charlie', entityType: TYPE_UNCATEGORIZED},
    {name: 'Delta', entityType: TYPE_UNCATEGORIZED},
    {name: 'Echo', entityType: TYPE_UNCATEGORIZED},
    {name: 'Foxtrot', entityType: TYPE_UNCATEGORIZED},
    {name: 'Golf', entityType: TYPE_UNCATEGORIZED},
    {name: 'Hotel', entityType: TYPE_UNCATEGORIZED},
    {name: 'India', entityType: TYPE_UNCATEGORIZED},
    {name: 'Juliett', entityType: TYPE_UNCATEGORIZED},
    {name: 'Kilo', entityType: TYPE_UNCATEGORIZED},
    {name: 'Lima', entityType: TYPE_UNCATEGORIZED},
    {name: 'Mike', entityType: TYPE_UNCATEGORIZED},
    {name: 'November', entityType: TYPE_UNCATEGORIZED},
    {name: 'Oscar', entityType: TYPE_UNCATEGORIZED},
    {name: 'Papa', entityType: TYPE_UNCATEGORIZED},
    {name: 'Quebec', entityType: TYPE_UNCATEGORIZED},
    {name: 'Romeo', entityType: TYPE_UNCATEGORIZED},
    {name: 'Sierra', entityType: TYPE_UNCATEGORIZED},
    {name: 'Tango', entityType: TYPE_UNCATEGORIZED},
    {name: 'Uniform', entityType: TYPE_UNCATEGORIZED},
    {name: 'Victor', entityType: TYPE_UNCATEGORIZED},
    {name: 'Whiskey', entityType: TYPE_UNCATEGORIZED},
    {name: 'X-ray', entityType: TYPE_UNCATEGORIZED},
    {name: 'Yankee', entityType: TYPE_UNCATEGORIZED},
    {name: 'Zulu', entityType: TYPE_UNCATEGORIZED},
  ];

  const noConflicts = (assert, rule, name) => {
    let conflicts = rule.check(name);
    assert.strictEqual(conflicts.length, 0, `Conflicts for ${rule.id}.check(${name}): ${conflicts.map(c => c.description)}`);
  };

  const conflictsWithExisting = (assert, rule, name, existing, descriptionPattern) => {
    let conflicts = rule.check(name);
    assert.notEqual(conflicts.length, 0, `Conflicts for ${name}`);
    conflicts.forEach((x) => assert.strictEqual(x.ruleId, rule.id));
    let found = conflicts.find((x) => x.conflictingHandle.name === existing);
    assert.ok(found, `${existing} in ${JSON.stringify(conflicts)}`);
    assert.strictEqual(found.candidateName, name);
    assert.ok(found.description.match(descriptionPattern), `no match for ${descriptionPattern}`);
  };

  test('ALL_RULE_CLASSES contains all rules', function(assert) {
    let ids = ALL_RULE_CLASSES.map((clazz) => new clazz([]).id).sort();
    assert.deepEqual(ids, [
      'american-soundex',
      'double-metaphone',
      'edit-distance',
      'experimental-eye-rhyme',
      'eye-rhyme',
      'min-length',
      TYPE_PHONETIC_ALPHABET,
      'substring'
    ]);
  });

  // eslint-disable-next-line qunit/require-expect
  test('all rules ignore empty string', function(assert) {
    const handles = [{name: 'Foo Bar', entityType: 'jargon'}];
    for (let ruleClass of ALL_RULE_CLASSES) {
      let rule = new ruleClass(handles);
      noConflicts(assert, rule, '');
      noConflicts(assert, rule, ' ');
      noConflicts(assert, rule, '   ');
      noConflicts(assert, rule, '\t\n');
    }
  });

  // === MinLengthRule tests ===
  // eslint-disable-next-line qunit/require-expect
  test('min-length allows three letters', function(assert) {
    const rule = new MinLengthRule();
    noConflicts(assert, rule, 'Bob');
    noConflicts(assert, rule, 'Danger');
  });

  test('min-length rejects one letter', function(assert) {
    const rule = new MinLengthRule();
    let conflicts = rule.check('X');
    assert.strictEqual(conflicts.length, 1);
    assert.strictEqual(conflicts[0].candidateName, 'X');
    assert.ok(conflicts[0].description.match(/too short/));
  });

  test('min-length rejects two letters', function(assert) {
    const rule = new MinLengthRule();
    let conflicts = rule.check('Ed');
    assert.strictEqual(conflicts.length, 1);
    assert.strictEqual(conflicts[0].candidateName, 'Ed');
    assert.ok(conflicts[0].description.match(/too short/));
  });

  // eslint-disable-next-line qunit/require-expect
  test('min-length rejects two capital letters', function(assert) {
    const rule = new MinLengthRule();
    noConflicts(assert, rule, 'LK');
  });

  // eslint-disable-next-line qunit/require-expect
  test('min-length allows numbers with at least one letter', function(assert) {
    const rule = new MinLengthRule();
    noConflicts(assert, rule, 'Go2Girl');
    noConflicts(assert, rule, '2x4');
    noConflicts(assert, rule, 'B-4');
  });


  // eslint-disable-next-line qunit/require-expect
  test('min-length rejects non-alphabetic', function(assert) {
    const rule = new MinLengthRule();
    const checkit = (name) => {
      let conflicts = rule.check(name);
      assert.strictEqual(conflicts.length, 1, `${JSON.stringify(conflicts)} conflicts for ${name}`);
      assert.strictEqual(conflicts[0].candidateName, name);
      assert.strictEqual(conflicts[0].description, 'should have letters');
    };
    checkit('137');
    checkit('54 46');
    checkit('@#!');
    checkit('\u0391\u0392\u0393');
    checkit(String.fromCodePoint(0x1F4A9));
  });


  // === PhoneticAlphabetRule tests ===
  // eslint-disable-next-line qunit/require-expect
  test('phonetic-alphabet rejects names with just NATO letters', function(assert) {
    const rule = new PhoneticAlphabetRule(natoHandles);
    let checkit = (name) => {
      let result = rule.check(name);
      assert.strictEqual(result.length, 1, `Got ${result.length} conflicts for ${name}`);
      assert.strictEqual(result[0].candidateName, name);
      assert.ok(result[0].description.match('phonetic alphabet'), `Check for ${name}`);
    };
    checkit('Fox Trot');
    checkit('FoxTrot');
    checkit('Tango Charlie');
    checkit('golf uniform');
    checkit('Romeo & Juliett');
    checkit('WhiskeyTangoFoxtrot');
    checkit('Quebec2Lima');
  });

  // eslint-disable-next-line qunit/require-expect
  test('phonetic-alphabet accepts names with more than NATO letters', function(assert) {
    const rule = new PhoneticAlphabetRule(natoHandles);
    noConflicts(assert, rule, 'Baker');
    noConflicts(assert, rule, 'Indian');
    noConflicts(assert, rule, 'Wherefore Romeo');
    noConflicts(assert, rule, 'Quebec City');
    noConflicts(assert, rule, '2 Kilos');
    noConflicts(assert, rule, 'Hotels');
  });

  // === SubstringRule tests ===
  // eslint-disable-next-line qunit/require-expect
  test('substring rejects exact matches', function(assert) {
    const rule = new SubstringRule(wordHandles);
    let checkit = (name, existing) =>
      conflictsWithExisting(assert, rule, name, existing, 'in use');
    checkit('Zulu', 'Zulu');
    checkit('golf', 'Golf');
    // checkit('CHARLIE', 'Charlie'); // CHARLIE now treated as 'C H A R L I E'
    checkit('SiErRa', 'Sierra');
    checkit('wHiSkEy', 'Whiskey');
  });

  // eslint-disable-next-line qunit/require-expect
  test('substring rejects partial matches', function(assert) {
    const rule = new SubstringRule(wordHandles);
    let checkit = (name, existing) =>
      conflictsWithExisting(assert, rule, name, existing, `${existing} contains`);
    checkit('Fox', 'Foxtrot');
    checkit('Ray', 'X-ray');
    checkit('Julie', 'Juliett');
    checkit('pa', 'Papa');
    checkit('eMbEr', 'November');
    checkit('ot', 'Hotel');
    checkit('ot', 'Foxtrot');
  });

  // eslint-disable-next-line qunit/require-expect
  test('substring rejects names that contain another name', function(assert) {
    const rule = new SubstringRule(wordHandles);
    let checkit = (name, existing) =>
      conflictsWithExisting(assert, rule, name, existing, `contains ${existing}`);
    checkit('AlfalfA', 'Alfa');
    checkit('TheGolfather', 'Golf');
    checkit('paparazi', 'Papa');
    checkit('Gary Indiana', 'India');
    checkit('Hotel Moron', 'Hotel');
    checkit('CzEcHoSlOvAkIa', 'Echo');
  });

  // eslint-disable-next-line qunit/require-expect
  test('substring accepts non-substring names', function(assert) {
    const rule = new SubstringRule(wordHandles);
    noConflicts(assert, rule, 'Danger');
    noConflicts(assert, rule, 'Fawkestrot');
    noConflicts(assert, rule, 'Romero');
    noConflicts(assert, rule, 'Unicorn');
    noConflicts(assert, rule, 'Alice Bob Carol');
  });

  // eslint-disable-next-line qunit/require-expect
  test('substring rejects acronym matches', function(assert) {
    const acronymHandles = [
      {name: 'L E', entityType: 'jargon'},
      {name: 'B-L-M', entityType: 'jargon'},
      {name: 'r.e.m.', entityType: 'jargon'},
    ];
    const rule = new SubstringRule(acronymHandles);
    let exactMatch = (name, existing) =>
      conflictsWithExisting(assert, rule, name, existing, `${existing} is already in use`);
    let substringMatch = (name, existing) =>
      conflictsWithExisting(assert, rule, name, existing, `contains ${existing}`);
    exactMatch('L E', 'L E');
    exactMatch('l e', 'L E');
    exactMatch('l-e', 'L E');
    substringMatch('L E O', 'L E');
    substringMatch('L-E-A-L', 'L E');
    substringMatch('A.B.L.E.', 'L E');
    exactMatch('B.L.M', 'B-L-M');
    exactMatch('B L M', 'B-L-M');
    exactMatch('b L m', 'B-L-M');
    substringMatch('B.L.M. H.Q.', 'B-L-M');
    substringMatch('U-S-F-S B-L-M N-P-S', 'B-L-M');
    exactMatch('r.e.m.', 'r.e.m.');
    exactMatch('R.E.M', 'r.e.m.');
    exactMatch('R-E M', 'r.e.m.');
    exactMatch('R E M', 'r.e.m.');
    substringMatch('R E M S.L.E-E-P-', 'r.e.m.');
  });

  // eslint-disable-next-line qunit/require-expect
  test('substring accepts non-acronym matches to acronyms', function(assert) {
    const acronymHandles = [
      {name: 'L E', entityType: 'jargon'},
      {name: 'B-L-M', entityType: 'jargon'},
      {name: 'r.e.m.', entityType: 'jargon'},
    ];
    const rule = new SubstringRule(acronymHandles);
    let substringMatch = (name, existing) =>
      conflictsWithExisting(assert, rule, name, existing, `contains ${existing}`);
    noConflicts(assert, rule, 'Leaf');
    noConflicts(assert, rule, 'abLE');
    noConflicts(assert, rule, 'Bald Eagle');
    substringMatch('Bell Eagle', 'L E'); // Bell end with L, Eagle starts with E
    noConflicts(assert, rule, 'fechez le vache');
    noConflicts(assert, rule, 'Kablm');
    substringMatch('BLM Director', 'B-L-M');
    substringMatch("BOB L'May", 'B-L-M');
    substringMatch('rob l. martin', 'B-L-M');
    noConflicts(assert, rule, 'Remember');
    //noConflicts(assert, rule, 'rem'); // "rem" vs. "are ee em"
    substringMatch('R.E.M. Songs', 'r.e.m.');
  });

  // === EditDistanceRule tests ===
  // eslint-disable-next-line qunit/require-expect
  test('edit-distance rejects one character different', function(assert) {
    const rule = new EditDistanceRule(wordHandles);
    let checkit = (name, existing) =>
      conflictsWithExisting(assert, rule, name, existing, `is spelled like ${existing}`);
    checkit('Braco', 'Bravo'); // change
    checkit('Gold', 'Golf'); // change
    checkit('mile', 'Mike'); // change
    checkit('Movember', 'November'); // change
    checkit('Yanker', 'Yankee'); // change
    checkit('oshcar', 'Oscar'); // add
    checkit('ViCtOrY', 'Victor'); // add
    checkit('ZUL', 'Zulu'); // add
    checkit('I\'m A', 'Lima'); // remove
    checkit('Rome', 'Romeo'); // remove
  });

  // eslint-disable-next-line qunit/require-expect
  test('edit-distance accepts 2+ characters different', function(assert) {
    const rule = new EditDistanceRule(wordHandles);
    noConflicts(assert, rule, 'Alpha');
    noConflicts(assert, rule, 'Bravado');
    noConflicts(assert, rule, 'Golfer');
    noConflicts(assert, rule, 'Julie');
    noConflicts(assert, rule, 'Vember');
    noConflicts(assert, rule, 'Popo');
    noConflicts(assert, rule, 'Sierra Nevada');
    noConflicts(assert, rule, 'Sex-ray');
    noConflicts(assert, rule, 'Wanker');
  });

  // === AmericanSoundexRule tests ===
  // eslint-disable-next-line qunit/require-expect
  test('american-soundex rejects when soundex matches', function(assert) {
    const rule = new AmericanSoundexRule(wordHandles);
    let checkit = (name, existing) =>
      conflictsWithExisting(assert, rule, name, existing, `may sound like ${existing}`);
    checkit('alpha', 'Alfa');
    checkit('BRAVE', 'Bravo');
    checkit('Charly', 'Charlie');
    checkit('FocsDryad', 'Foxtrot');
    checkit('Jeweled', 'Juliett');
    checkit('Mice', 'Mike');
    checkit('Nabenfir', 'November');
    checkit('Popo', 'Papa');
    checkit('Sero', 'Sierra');
    checkit('Victoria', 'Victor');
    checkit('Wishco', 'Whiskey');
  });

  // eslint-disable-next-line qunit/require-expect
  test('american-soundex accepts when soundex does not match', function(assert) {
    const rule = new AmericanSoundexRule(wordHandles);
    noConflicts(assert, rule, 'Elfa');
    noConflicts(assert, rule, 'Shirley');
    noConflicts(assert, rule, 'Tilde');
    noConflicts(assert, rule, 'Foxrot');
    noConflicts(assert, rule, 'Motel');
    noConflicts(assert, rule, 'Nike');
    noConflicts(assert, rule, 'Quebec City');
    noConflicts(assert, rule, 'Unicorn');
    noConflicts(assert, rule, 'Vitcor');
    noConflicts(assert, rule, '4242');
  });

  // === DoubleMetaphoneRule tests ===
  // eslint-disable-next-line qunit/require-expect
  test('double-metaphone rejects when metaphone matches', function(assert) {
    const rule = new DoubleMetaphoneRule(wordHandles);
    let checkit = (name, existing) =>
      conflictsWithExisting(assert, rule, name, existing, `may sound like ${existing}`);
    checkit('alpha', 'Alfa');
    checkit('Elpha', 'Alfa');
    checkit('BRAVE', 'Bravo');
    checkit('Shirley', 'Charlie');
    checkit('tilde', 'Delta');
    checkit('Phockstroth', 'Foxtrot');
    checkit('FocsDryad', 'Foxtrot');
    checkit('K. L. F.', 'Golf');
    checkit('Jeweled', 'Juliett');
    checkit('Popo', 'Papa');
    checkit('Sero', 'Sierra');
    checkit('Victoria', 'Victor');
  });

  // eslint-disable-next-line qunit/require-expect
  test('double-metaphone accepts when metaphone does not match', function(assert) {
    const rule = new DoubleMetaphoneRule(wordHandles);
    noConflicts(assert, rule, 'Foxrot');
    noConflicts(assert, rule, 'Motel');
    noConflicts(assert, rule, 'Mice');
    noConflicts(assert, rule, 'Nike');
    noConflicts(assert, rule, 'Nabenfir');
    noConflicts(assert, rule, 'Quebec City');
    noConflicts(assert, rule, 'Unicorn');
    noConflicts(assert, rule, 'Vitcor');
    noConflicts(assert, rule, 'Wishco');
    noConflicts(assert, rule, '4242');
  });

  // === EyeRhymeRule tests ===
  // eslint-disable-next-line qunit/require-expect
  test('eye-rhyme rejects when one syllable is spelled like another', function(assert) {
    const rule = new EyeRhymeRule(wordHandles);
    let checkit = (name, existing, multiple = false) =>
      conflictsWithExisting(assert, rule, name, existing,
        multiple ? `rhyming syllables with ${existing}` : `a syllable rhyming with ${existing}`);
    // Several of these test cases are opportunities to improve the algorithm,
    // if code changes and breaks these tests, it may be a positive sign.
    // A lot of the phonetic letters have syllables without a coda, so this
    // test using just the NATO alphabet is particularly awkward.
    checkit('Alfalfa', 'Alfa', true);
    checkit('Da Mal', 'Alfa'); // not a great match
    checkit('A', 'Bravo'); // not a great match
    checkit('You lie', 'Charlie');
    checkit('Nice Car!', 'Charlie');
    checkit('gwar', 'Charlie'); // not a great match
    checkit('Ta Bel', 'Delta', true); // not a great match
    checkit('Malta', 'Delta'); // non-multiple
    checkit('Go be', 'Echo'); // not a great match
    checkit('Unboxt', 'Foxtrot'); // foxt/rot rather than fox/trot
    checkit('Adolf', 'Golf');
    checkit('olfactory', 'Golf');
    checkit('Elgo', 'Hotel'); // not a great match
    checkit('Shia mind', 'India', true);
    checkit('Zulu', 'Juliett', true); // so-so match
    checkit('Loki', 'Kilo', true);
    checkit('O-I', 'Kilo', true); // not a great match
    checkit('I, A Word', 'Lima', true); // not a great match
    checkit('Hike', 'Mike');
    checkit('Remember', 'November', true);
    checkit('Alemonger', 'November'); // not a good match
    checkit('A', 'Papa', true); // not a great match
    checkit('accrue', 'Quebec'); // not a great match
    checkit('OK', 'Romeo');
    checkit('Amplifier', 'Sierra'); // not a great match
    checkit('The Man', 'Tango'); // not a great match
    checkit('Maelstorm', 'Uniform');
    checkit('unique', 'Uniform', true); // not a great match
    checkit('Hiccup', 'Victor'); // not a great match
    checkit('Misdeed', 'Whiskey');
    checkit('They Is', 'Whiskey', true); // not a good match
    checkit('Nice Day', 'X-ray');
    checkit('Mr. X', 'X-ray');
    checkit('An old bee', 'Yankee');
    checkit('I <3 U', 'Zulu', true); // not a good match
  });

  // eslint-disable-next-line qunit/require-expect
  test('eye-rhyme accepts when no syllables rhyme', function(assert) {
    const rule = new EyeRhymeRule(wordHandles);
    // Some of these should have a conflict.  If the algorithm is improved, remove the check.
    noConflicts(assert, rule, 'Adolph'); // should rhyme with Golf
    noConflicts(assert, rule, 'oubliette'); // should rhyme with Juliett
    noConflicts(assert, rule, 'Keee-Low'); // should rhyme with Kilo
    noConflicts(assert, rule, 'forme'); // should rhyme with Uniform
    noConflicts(assert, rule, 'Mice'); // silent e
    noConflicts(assert, rule, 'Vine');
    noConflicts(assert, rule, 'bang');
    noConflicts(assert, rule, 'T-Rex');
    noConflicts(assert, rule, '4242');
  });
});
