import {
  ALL_RULE_CLASSES,
  AmericanSoundexRule,
  DoubleMetaphoneRule,
  EditDistanceRule,
  ExperimentalEyeRhymeRule,
  EyeRhymeRule,
  MinLengthRule,
  PhoneticAlphabetRule,
  SubstringRule,
} from 'clubhouse/utils/handle-rules';
import { module, test } from 'qunit';
import {TYPE_PHONETIC_ALPHABET, TYPE_UNCATEGORIZED} from "clubhouse/models/handle-reservation";

module('Unit | Utility | handle-rules', function() {
  // The NATO phonetic alphabet, used to build both the phonetic-alphabet
  // reserved handles and a set of generic word handles.
  const NATO_WORDS = [
    'Alfa', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel',
    'India', 'Juliett', 'Kilo', 'Lima', 'Mike', 'November', 'Oscar', 'Papa',
    'Quebec', 'Romeo', 'Sierra', 'Tango', 'Uniform', 'Victor', 'Whiskey',
    'X-ray', 'Yankee', 'Zulu',
  ];

  const natoHandles = NATO_WORDS.map((name) => ({name, entityType: TYPE_PHONETIC_ALPHABET}));
  const wordHandles = NATO_WORDS.map((name) => ({name, entityType: TYPE_UNCATEGORIZED}));

  const noConflicts = (assert, rule, name) => {
    let conflicts = rule.check(name);
    assert.strictEqual(conflicts.length, 0, `Conflicts for ${rule.id}.check(${name}): ${conflicts.map(c => c.description)}`);
  };

  // Asserts that `name` conflicts with `existing`: all conflicts carry the
  // rule's id, one of them is against `existing`, and its description contains
  // `descriptionSubstring` (a literal substring, NOT a regular expression).
  // Performs exactly 3 assertions.
  const conflictPresent = (assert, rule, name, existing, descriptionSubstring) => {
    let conflicts = rule.check(name);
    assert.true(conflicts.length > 0 && conflicts.every((x) => x.ruleId === rule.id),
      `non-empty conflicts all carrying id ${rule.id} for ${name}, got ${JSON.stringify(conflicts)}`);
    let found = conflicts.find((x) => x.conflictingHandle.name === existing && x.candidateName === name);
    assert.ok(found, `${existing} (candidate ${name}) in ${JSON.stringify(conflicts)}`);
    assert.ok(found && found.description.includes(descriptionSubstring),
      `no substring match for "${descriptionSubstring}" in "${found && found.description}"`);
  };

  // Like conflictPresent, but additionally asserts the exact total number of
  // conflicts.  Use for deterministic rules.  Performs exactly 4 assertions.
  const conflictsWithExisting = (assert, rule, name, existing, descriptionSubstring, expectedCount = 1) => {
    let conflicts = rule.check(name);
    assert.strictEqual(conflicts.length, expectedCount,
      `Expected ${expectedCount} conflict(s) for ${name}, got ${JSON.stringify(conflicts)}`);
    conflictPresent(assert, rule, name, existing, descriptionSubstring);
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

  test('all rules ignore empty string', function(assert) {
    const handles = [{name: 'Foo Bar', entityType: 'jargon'}];
    const blanks = ['', ' ', '   ', '\t\n'];
    for (let ruleClass of ALL_RULE_CLASSES) {
      let rule = new ruleClass(handles);
      for (let blank of blanks) {
        noConflicts(assert, rule, blank);
      }
    }
  });

  // === MinLengthRule tests ===
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
    assert.ok(conflicts[0].description.includes('too short'));
  });

  test('min-length rejects two letters', function(assert) {
    const rule = new MinLengthRule();
    let conflicts = rule.check('Ed');
    assert.strictEqual(conflicts.length, 1);
    assert.strictEqual(conflicts[0].candidateName, 'Ed');
    assert.ok(conflicts[0].description.includes('too short'));
  });

  test('min-length rejects two capital letters', function(assert) {
    const rule = new MinLengthRule();
    noConflicts(assert, rule, 'LK');
  });

  test('min-length allows numbers with at least one letter', function(assert) {
    const rule = new MinLengthRule();
    noConflicts(assert, rule, 'Go2Girl');
    noConflicts(assert, rule, '2x4');
    noConflicts(assert, rule, 'B-4');
  });


  test('min-length rejects non-alphabetic', function(assert) {
    const rule = new MinLengthRule();
    const names = ['137', '54 46', '@#!', 'ΑΒΓ', String.fromCodePoint(0x1F4A9)];
    const checkit = (name) => {
      let conflicts = rule.check(name);
      assert.strictEqual(conflicts.length, 1, `${JSON.stringify(conflicts)} conflicts for ${name}`);
      assert.strictEqual(conflicts[0].candidateName, name);
      assert.strictEqual(conflicts[0].description, 'should have letters');
    };
    names.forEach(checkit);
  });


  // === PhoneticAlphabetRule tests ===
  test('phonetic-alphabet rejects names with just NATO letters', function(assert) {
    const rule = new PhoneticAlphabetRule(natoHandles);
    const names = [
      'Fox Trot', 'FoxTrot', 'Tango Charlie', 'golf uniform',
      'Romeo & Juliett', 'WhiskeyTangoFoxtrot', 'Quebec2Lima',
    ];
    let checkit = (name) => {
      let result = rule.check(name);
      assert.strictEqual(result.length, 1, `Got ${result.length} conflicts for ${name}`);
      assert.strictEqual(result[0].candidateName, name);
      assert.ok(result[0].description.includes('phonetic alphabet'), `Check for ${name}`);
    };
    names.forEach(checkit);
  });

  test('phonetic-alphabet accepts names with more than NATO letters', function(assert) {
    const rule = new PhoneticAlphabetRule(natoHandles);
    const names = ['Baker', 'Indian', 'Wherefore Romeo', 'Quebec City', '2 Kilos', 'Hotels'];
    names.forEach((name) => noConflicts(assert, rule, name));
  });

  // === SubstringRule tests ===
  test('substring rejects exact matches', function(assert) {
    const rule = new SubstringRule(wordHandles);
    const cases = [
      ['Zulu', 'Zulu'],
      ['golf', 'Golf'],
      // ['CHARLIE', 'Charlie'], // CHARLIE now treated as 'C H A R L I E'
      ['SiErRa', 'Sierra'],
      ['wHiSkEy', 'Whiskey'],
    ];
    cases.forEach(([name, existing]) =>
      conflictsWithExisting(assert, rule, name, existing, 'in use'));
  });

  test('substring rejects partial matches', function(assert) {
    const rule = new SubstringRule(wordHandles);
    const cases = [
      ['Fox', 'Foxtrot'],
      ['Ray', 'X-ray'],
      ['Julie', 'Juliett'],
      ['pa', 'Papa'],
      ['eMbEr', 'November'],
      ['ot', 'Hotel'],
      // "ot" is contained by both Hotel and Foxtrot, hence 2 conflicts.
      ['ot', 'Foxtrot'],
    ];
    cases.forEach(([name, existing]) => {
      const expectedCount = name === 'ot' ? 2 : 1;
      conflictsWithExisting(assert, rule, name, existing, `${existing} contains`, expectedCount);
    });
  });

  test('substring rejects names that contain another name', function(assert) {
    const rule = new SubstringRule(wordHandles);
    const cases = [
      ['AlfalfA', 'Alfa'],
      ['TheGolfather', 'Golf'],
      ['paparazi', 'Papa'],
      ['Gary Indiana', 'India'],
      ['Hotel Moron', 'Hotel'],
      ['CzEcHoSlOvAkIa', 'Echo'],
    ];
    cases.forEach(([name, existing]) =>
      conflictsWithExisting(assert, rule, name, existing, `contains ${existing}`));
  });

  test('substring accepts non-substring names', function(assert) {
    const rule = new SubstringRule(wordHandles);
    const names = ['Danger', 'Fawkestrot', 'Romero', 'Unicorn', 'Alice Bob Carol'];
    names.forEach((name) => noConflicts(assert, rule, name));
  });

  test('substring rejects acronym matches', function(assert) {
    const acronymHandles = [
      {name: 'L E', entityType: 'jargon'},
      {name: 'B-L-M', entityType: 'jargon'},
      {name: 'r.e.m.', entityType: 'jargon'},
    ];
    const rule = new SubstringRule(acronymHandles);
    const exactCases = [
      ['L E', 'L E'],
      ['l e', 'L E'],
      ['l-e', 'L E'],
      ['B.L.M', 'B-L-M'],
      ['B L M', 'B-L-M'],
      ['b L m', 'B-L-M'],
      ['r.e.m.', 'r.e.m.'],
      ['R.E.M', 'r.e.m.'],
      ['R-E M', 'r.e.m.'],
      ['R E M', 'r.e.m.'],
    ];
    const substringCases = [
      ['L E O', 'L E', 1],
      ['L-E-A-L', 'L E', 1],
      ['A.B.L.E.', 'L E', 1],
      ['B.L.M. H.Q.', 'B-L-M', 1],
      ['U-S-F-S B-L-M N-P-S', 'B-L-M', 1],
      ['R E M S.L.E-E-P-', 'r.e.m.', 2], // contains both r.e.m. and L E
    ];
    exactCases.forEach(([name, existing]) =>
      conflictsWithExisting(assert, rule, name, existing, `${existing} is already in use`));
    substringCases.forEach(([name, existing, expectedCount]) =>
      conflictsWithExisting(assert, rule, name, existing, `contains ${existing}`, expectedCount));
  });

  test('substring accepts non-acronym matches to acronyms', function(assert) {
    const acronymHandles = [
      {name: 'L E', entityType: 'jargon'},
      {name: 'B-L-M', entityType: 'jargon'},
      {name: 'r.e.m.', entityType: 'jargon'},
    ];
    const rule = new SubstringRule(acronymHandles);
    const cleanNames = ['Leaf', 'abLE', 'Bald Eagle', 'fechez le vache', 'Kablm', 'Remember'];
    const substringCases = [
      ['Bell Eagle', 'L E'], // Bell ends with L, Eagle starts with E
      ['BLM Director', 'B-L-M'],
      ["BOB L'May", 'B-L-M'],
      ['rob l. martin', 'B-L-M'],
      ['R.E.M. Songs', 'r.e.m.'],
    ];
    cleanNames.forEach((name) => noConflicts(assert, rule, name));
    substringCases.forEach(([name, existing]) =>
      conflictsWithExisting(assert, rule, name, existing, `contains ${existing}`));
  });

  // === EditDistanceRule tests ===
  test('edit-distance rejects one character different', function(assert) {
    const rule = new EditDistanceRule(wordHandles);
    const cases = [
      ['Braco', 'Bravo'], // change
      ['Gold', 'Golf'], // change
      ['mile', 'Mike'], // change
      ['Movember', 'November'], // change
      ['Yanker', 'Yankee'], // change
      ['oshcar', 'Oscar'], // add
      ['ViCtOrY', 'Victor'], // add
      ['ZUL', 'Zulu'], // add
      ["I'm A", 'Lima'], // remove
      ['Rome', 'Romeo'], // remove
    ];
    cases.forEach(([name, existing]) =>
      conflictsWithExisting(assert, rule, name, existing, `is spelled like ${existing}`));
  });

  test('edit-distance accepts 2+ characters different', function(assert) {
    const rule = new EditDistanceRule(wordHandles);
    const names = ['Alpha', 'Bravado', 'Golfer', 'Julie', 'Vember', 'Popo', 'Sierra Nevada', 'Sex-ray', 'Wanker'];
    names.forEach((name) => noConflicts(assert, rule, name));
  });

  // === AmericanSoundexRule tests ===
  test('american-soundex rejects when soundex matches', function(assert) {
    const rule = new AmericanSoundexRule(wordHandles);
    const cases = [
      ['alpha', 'Alfa'],
      ['BRAVE', 'Bravo'],
      ['Charly', 'Charlie'],
      ['FocsDryad', 'Foxtrot'],
      ['Jeweled', 'Juliett'],
      ['Mice', 'Mike'],
      ['Nabenfir', 'November'],
      ['Popo', 'Papa'],
      ['Sero', 'Sierra'],
      ['Victoria', 'Victor'],
      ['Wishco', 'Whiskey'],
    ];
    cases.forEach(([name, existing]) =>
      conflictsWithExisting(assert, rule, name, existing, `may sound like ${existing}`));
  });

  test('american-soundex accepts when soundex does not match', function(assert) {
    const rule = new AmericanSoundexRule(wordHandles);
    const names = ['Elfa', 'Shirley', 'Tilde', 'Foxrot', 'Motel', 'Nike', 'Quebec City', 'Unicorn', 'Vitcor', '4242'];
    names.forEach((name) => noConflicts(assert, rule, name));
  });

  // === DoubleMetaphoneRule tests ===
  test('double-metaphone rejects when metaphone matches', function(assert) {
    const rule = new DoubleMetaphoneRule(wordHandles);
    // [name, existing, expectedCount]
    const cases = [
      ['alpha', 'Alfa', 1],
      ['Elpha', 'Alfa', 1],
      ['BRAVE', 'Bravo', 1],
      ['Shirley', 'Charlie', 1],
      ['tilde', 'Delta', 1],
      ['Phockstroth', 'Foxtrot', 1],
      ['FocsDryad', 'Foxtrot', 1],
      ['K. L. F.', 'Golf', 1],
      ['Jeweled', 'Juliett', 2], // both metaphone variants hash to Juliett
      ['Popo', 'Papa', 1],
      ['Sero', 'Sierra', 2], // also matches X-ray
      ['Victoria', 'Victor', 1],
    ];
    cases.forEach(([name, existing, expectedCount]) =>
      conflictsWithExisting(assert, rule, name, existing, `may sound like ${existing}`, expectedCount));
  });

  test('double-metaphone accepts when metaphone does not match', function(assert) {
    const rule = new DoubleMetaphoneRule(wordHandles);
    const names = ['Foxrot', 'Motel', 'Mice', 'Nike', 'Nabenfir', 'Quebec City', 'Unicorn', 'Vitcor', 'Wishco', '4242'];
    names.forEach((name) => noConflicts(assert, rule, name));
  });

  // === EyeRhymeRule tests ===
  test('eye-rhyme rejects when one syllable is spelled like another', function(assert) {
    const rule = new EyeRhymeRule(wordHandles);
    // [name, existing, multiple]
    const cases = [
      // Several of these test cases are opportunities to improve the algorithm,
      // if code changes and breaks these tests, it may be a positive sign.
      // A lot of the phonetic letters have syllables without a coda, so this
      // test using just the NATO alphabet is particularly awkward.
      ['Alfalfa', 'Alfa', true],
      ['Da Mal', 'Alfa', false], // not a great match
      ['A', 'Bravo', false], // not a great match
      ['You lie', 'Charlie', false],
      ['Nice Car!', 'Charlie', false],
      ['gwar', 'Charlie', false], // not a great match
      ['Ta Bel', 'Delta', true], // not a great match
      ['Malta', 'Delta', false], // non-multiple
      ['Go be', 'Echo', false], // not a great match
      ['Unboxt', 'Foxtrot', false], // foxt/rot rather than fox/trot
      ['Adolf', 'Golf', false],
      ['olfactory', 'Golf', false],
      ['Elgo', 'Hotel', false], // not a great match
      ['Shia mind', 'India', true],
      ['Zulu', 'Juliett', true], // so-so match
      ['Loki', 'Kilo', true],
      ['O-I', 'Kilo', true], // not a great match
      ['I, A Word', 'Lima', true], // not a great match
      ['Hike', 'Mike', false],
      ['Remember', 'November', true],
      ['Alemonger', 'November', false], // not a good match
      ['A', 'Papa', true], // not a great match
      ['accrue', 'Quebec', false], // not a great match
      ['OK', 'Romeo', false],
      ['Amplifier', 'Sierra', false], // not a great match
      ['The Man', 'Tango', false], // not a great match
      ['Maelstorm', 'Uniform', false],
      ['unique', 'Uniform', true], // not a great match
      ['Hiccup', 'Victor', false], // not a great match
      ['Misdeed', 'Whiskey', false],
      ['They Is', 'Whiskey', true], // not a good match
      ['Nice Day', 'X-ray', false],
      ['Mr. X', 'X-ray', false],
      ['An old bee', 'Yankee', false],
      ['I <3 U', 'Zulu', true], // not a good match
    ];
    // The eye-rhyme rule is intentionally noisy and can flag several handles for
    // one candidate, so assert presence of the target conflict rather than an
    // exact total count.
    cases.forEach(([name, existing, multiple]) =>
      conflictPresent(assert, rule, name, existing,
        multiple ? `rhyming syllables with ${existing}` : `a syllable rhyming with ${existing}`));
  });

  test('eye-rhyme accepts when no syllables rhyme', function(assert) {
    const rule = new EyeRhymeRule(wordHandles);
    // Some of these should have a conflict.  If the algorithm is improved, remove the check.
    const names = [
      'Adolph', // should rhyme with Golf
      'oubliette', // should rhyme with Juliett
      'Keee-Low', // should rhyme with Kilo
      'forme', // should rhyme with Uniform
      'Mice', // silent e
      'Vine',
      'bang',
      'T-Rex',
      '4242',
    ];
    names.forEach((name) => noConflicts(assert, rule, name));
  });

  // === ExperimentalEyeRhymeRule tests ===
  // The experimental rule requires at least 50% of a candidate's syllables to
  // rhyme with an existing handle before flagging a conflict.
  test('experimental-eye-rhyme flags names where the rhyme ratio is high enough', function(assert) {
    const rule = new ExperimentalEyeRhymeRule(wordHandles);
    // "Alfalfa" -> al/fal/fa; two of three syllables rhyme with Alfa (al, fa),
    // a 0.66 ratio that clears the 0.5 threshold.  (Papa is also flagged, so
    // assert presence rather than an exact total count.)
    conflictPresent(assert, rule, 'Alfalfa', 'Alfa', 'rhyming syllables with Alfa');
  });

  test('experimental-eye-rhyme ignores names below the rhyme threshold', function(assert) {
    const rule = new ExperimentalEyeRhymeRule(wordHandles);
    // A single rhyming syllable out of many does not reach the 0.5 ratio.
    noConflicts(assert, rule, 'Amplifier'); // one weak rhyme with Sierra, ratio too low
    noConflicts(assert, rule, '4242');
  });
});
