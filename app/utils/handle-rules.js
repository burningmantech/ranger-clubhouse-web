import doubleMetaphone from 'npm:double-metaphone';

/** Data object encapsulating a potential problem identified by a handle rule. */
export class HandleConflict {
  static comparator(a, b) {
    if (a.priority != b.priority){
      return HandleConflict.numericPriority(a.priority) - HandleConflict.numericPriority(b.priority);
    }
    if (a.ruleId != b.ruleId) {
      return a.ruleId.localeCompare(b.ruleId);
    }
    if (a.conflictingHandle && b.conflictingHandle) {
      return a.conflictingHandle.name.localeCompare(b.conflictingHandle.name);
    }
    return a.description.localeCompare(b.description);
  }

  static numericPriority(priority) {
    switch (priority) {
      case 'high': return 1;
      case 'medium': return 2;
      case 'low': return 3;
      default: throw new Error(`Unknown priority '${priority}'`);
    }
  }

  constructor(candidateName, description, priority, ruleId, conflictingHandle) {
    this.candidateName = candidateName;
    this.description = description;
    this.priority = priority;
    this.ruleId = ruleId;
    this.conflictingHandle = conflictingHandle;
  }
}


/** Warns about handles that are really short words, though initials like JC are allowed. */
export class MinLengthRule {
  get id() { return 'min-length'; }

  check(name) {
    const result = [];
    if (name.trim().length === 0) {
      return [];
    }
    if (!name.match(/[a-z]/i)) {
      result.push(new HandleConflict(name, 'should have letters', 'medium', this.id));
    } else if (name.length < 3 && !name.match(/^[A-Z]{2}$/)) {
      result.push(new HandleConflict(name, 'might be too short', 'high', this.id));
    }
    return result;
  }
}


/** Enforces the FCC's no-swearing-on-the-radio rule. */
export class FccRule {
  constructor() {
    // TODO consider putting these in the HandleController data response so rhyming checkers
    // can catch thins that rhyme with obscenities.
    this.obsceneWords = {
      // the Carlin 7
      'shit': true,
      'piss': true,
      'fuck': true,
      'cunt': true,
      'cocksucker': true,
      'motherfucker': true,
      'tits': true,
      // TODO other words?
    };
  }

  get id() { return 'fcc'; }

  check(name) {
    const result = [];
    for (const word of name.toLowerCase().split(/[^a-z]+/)) {
      if (this.obsceneWords[word]) {
        result.push(new HandleConflict(name, `${word} is frowned on by the FCC`, 'high', this.id));
      }
    }
    return result;
  }
}


/** Warns about names which consist entirely of NATO phonetic alphabet words, e.g. Tango Charlie. */
export class PhoneticAlphabetRule {
  constructor(handles) {
    const words = handles.filter((h) => h.entityType === 'phonetic-alphabet')
      .map((h) => this.normalizeName(h.name));
    this.phoneticRegex = new RegExp(`^(${words.join('|')})+$`, 'i');
  }

  get id() { return 'phonetic-alphabet'; }

  check(name) {
    if (this.normalizeName(name).match(this.phoneticRegex)) {
      return [new HandleConflict(name, 'consists entirely of NATO phonetic alphabet words', 'high', this.id)];
    }
    return [];
  }

  normalizeName(name) {
    // remove all space and punctuation; check runs all words together
    return name.replace(/[^A-Za-z]/g, '').toLowerCase();
  }
}


/** Points out any names which are a substring match, e.g. Boiler:Boilermaker. */
export class SubstringRule {
  constructor(handles) {
    this.normalizedHandles = {};
    for (const handle of handles) {
      this.normalizedHandles[this.normalizeName(handle.name)] = handle;
    }
  }

  get id() { return 'substring'; }

  check(rawName) {
    const result = [];
    const name = this.normalizeName(rawName);
    if (name.length === 0) {
      return result;
    }
    for (const [targetName, handle] of Object.entries(this.normalizedHandles)) {
      if (name.length === targetName.length) {
        if (name === targetName) {
          result.push(new HandleConflict(rawName, `${handle.name} is already in use`, 'high', this.id, handle));
        }
      } else if (name.length < targetName.length) {
        if (targetName.indexOf(name) >= 0) {
          result.push(new HandleConflict(rawName, `${handle.name} contains ${rawName}`, 'medium', this.id, handle));
        }
      } else {
        if (name.indexOf(targetName) >= 0) {
          result.push(new HandleConflict(rawName, `${rawName} contains ${handle.name}`, 'medium', this.id, handle));
        }
      }
    }
    return result;
  }

  normalizeName(name) {
    if (name.match(/^[A-Z]([ .-][A-Z])*$/)) {
      // Acronyms are usually pronounced letter-by-letter; don't flag phonemes
      // that happen to include them.  Transform to space-separated letters.
      return name.trim().replace(/\W+/g, '').split(new RegExp('')).join(' ');
    }
    return name.trim().toLowerCase().replace(/\W+/g, '');
  }
}


/** Finds handles based on Lvenshtein edit distance. */
export class EditDistanceRule {
  constructor(handles) {
    this.maxDistance = 1;
    this.normalizedHandles = {};
    for (const handle of handles) {
      this.normalizedHandles[this.normalizeName(handle.name)] = handle;
    }
  }

  get id() { return 'edit-distance'; }

  check(rawName) {
    const result = [];
    const name = this.normalizeName(rawName);
    if (name.length === 0) {
      return result;
    }
    for (const [targetName, handle] of Object.entries(this.normalizedHandles)) {
      if (this.withinEditDistance(name, targetName, this.maxDistance)
          && rawName.toLowerCase() !== handle.name.toLowerCase()) {
        result.push(new HandleConflict(rawName, `is spelled like ${handle.name}`, 'medium', this.id, handle));
      }
    }
    return result;
  }

  normalizeName(name) {
    return name.trim().toLowerCase().replace(/\W+/g, '');
  }

  withinEditDistance(source, target, maxDistance) {
    if (Math.abs(source.length - target.length) > maxDistance) {
      return false; // more than max insertions needed
    }
    // TODO this can be optimized by only calculating a diagonal slice of the
    // array of width 1 + 2 * maxDistance.  See Algorithms for Approximate String
    // Matching by Esko Ukkonen https://www.cs.helsinki.fi/u/ukkonen/InfCont85.PDF
    const d = new Array(source.length + 1);
    for (let i = 0; i <= source.length; ++i) {
      d[i] = new Array(target.length + 1);
      d[i][0] = i;
    }
    for (let j = 0; j <= target.length; ++j) {
      d[0][j] = j;
    }
    for (let j = 1; j <= target.length; ++j) {
      let rowMin = d[0][j];
      for (let i = 1; i <= source.length; ++i) {
        if (source.charAt(i - 1) === target.charAt(j - 1)) {
          d[i][j] = d[i - 1][j - 1];
        } else {
          d[i][j] = Math.min(
            d[i - 1][j] + 1,  // deletion
            d[i][j - 1] + 1,  // insertion
            d[i - 1][j - 1] + 1);  // substitution
        }
        rowMin = Math.min(rowMin, d[i][j]);
      }
      if (rowMin > maxDistance) {
        return false; // already exceeded max
      }
    }
    return d[source.length][target.length] <= maxDistance;
  }
}


/** Matches names using the old American Soundex phonetic algorithm. */
export class AmericanSoundexRule {
  constructor(handles) {
    this.maxLength = 6; // official soundex implementation is 4
    this.hashed = {}; // encoded name to array of matching handles
    for (const handle of handles) {
      const hash = this.soundex(handle.name);
      if (hash.length > 0) {
        if (!this.hashed[hash]) {
          this.hashed[hash] = [];
        }
        this.hashed[hash].push(handle);
      }
    }
  }

  get id() { return 'american-soundex'; }

  check(name) {
    const result = [];
    const hash = this.soundex(name);
    if (this.hashed[hash]) {
      const lowerName = name.toLowerCase();
      for (const handle of this.hashed[hash]) {
        if (lowerName !== handle.name.toLowerCase()) {
          result.push(new HandleConflict(name, `may sound like ${handle.name}`, 'medium', this.id, handle))
        }
      }
    }
    return result;
  }

  /**
   * From http://en.wikipedia.org/wiki/Soundex
   * 1. The first letter of the name is the letter of the Soundex code,
   *    and is not coded to a number.
   * 2. Replace consonants with digits as follows (after the first letter):
   *    b, f, p, v => 1
   *    c, g, j, k, q, s, x, z => 2
   *    d, t => 3
   *    l => 4
   *    m, n => 5
   *    r => 6
   *    h, w are not coded
   * 3. Two adjacent letters with the same number are coded as a
   *    single number. Letters with the same number separated by an
   *    h or w are also coded as a single number.
   * 4. Continue until you have one letter and three numbers.
   *    If you run out of letters, fill in 0s until there are three numbers.
   */
  soundex(name) {
    name = name.toUpperCase().replace(/[^A-Z]+/g, '');
    if (name.length === 0) {
      return '';
    }
    let result = name[0];
    let prevNum = this.numericValue(result);
    for (let i = 1; i < name.length && result.length < this.maxLength; ++i) {
      const num = this.numericValue(name[i]);
      if (num > 0 && num !== prevNum) {
        result += num;
      }
      if (num !== -2) { // H&W don't separate matching letters
        prevNum = num;
      }
    }
    while (result.length < this.maxLength) {
      result += '0';
    }
    return result;
  }

  numericValue(letter) {
    if (letter.match(/^[AEIOUY]/)) { return -1; }
    if (letter.match(/^[HW]/)) { return -2; }
    if (letter.match(/^[BFPV]/)) { return 1; }
    if (letter.match(/^[CGJKQSXZ]/)) { return 2; }
    if (letter.match(/^[DT]/)) { return 3; }
    if (letter.match(/^[L]/)) { return 4; }
    if (letter.match(/^[MN]/)) { return 5; }
    if (letter.match(/^[R]/)) { return 6; }
  }
}


/** Matches names using the Double Metaphone phonetic algorithm. */
export class DoubleMetaphoneRule {
  constructor(handles) {
    this.hashed = {}; // encoded name to array of handles
    for (const handle of handles) {
      for (const hash of this.metaphones(handle.name)) {
        if (!this.hashed[hash]) {
          this.hashed[hash] = [];
        }
        this.hashed[hash].push(handle);
      }
    }
  }

  get id() { return 'double-metaphone'; }

  check(name) {
    const result = [];
    for (const metaphone of this.metaphones(name)) {
      if (this.hashed[metaphone]) {
        const lowerName = name.toLowerCase();
        for (const handle of this.hashed[metaphone]) {
          if (lowerName !== handle.name.toLowerCase()) {
            result.push(new HandleConflict(name, `may sound like ${handle.name}`, 'medium', this.id, handle));
          }
        }
      }
    }
    return result;
  }

  metaphones(name) {
    const metaphones = doubleMetaphone(name);
    // metaphones is a two-element array; the second element is either
    // the "alternate" value, used for names that match certain patterns,
    // or the primary matching again.  Unhashable values (e.g. all numeric)
    // are empty strings.
    if (metaphones[0].length === 0) {
      return [];
    }
    if (metaphones[0] === metaphones[1]) {
      return [metaphones[0]];
    }
    return metaphones;
  }
}


/**
 * Support class for rhyming rules.  A syllable consists of an onset and a rime.  A rime consists of a nucleus
 * and a coda.  Onset and coda are consonant clusters, nucleus is a vowel or a dipthong
 * "breath" = {onset: br, rime: {nucleus: ea, coda: th}}
 * For long vowels in English orthography, the silentEnding may be 'e'.
 */
class Syllable {
  constructor(onset, nucleus, coda, silentEnding = '') {
    this.onset = onset;
    this.nucleus = nucleus;
    this.coda = coda;
    this.silentEnding = silentEnding;
  }

  get rime() { return this.nucleus + this.coda + this.silentEnding; }
}

/**
 * Identifies names which contain syllables that rhyme.  These are "eye rhymes" because they're based on spelling
 * rather than true punctuation.  By matching any rhyming syllable, this produces a lot of false positives.
 * TODO In poetry, a rhyme is the last stressed vowel to the end of the word.  Consider identifying stress so that
 * "avo" (not "o") matches "bravo."
 */
export class EyeRhymeRule {
  constructor(handles) {
    this.rimeIndex = {}; // rime to array of {handle, syllables[]}
    for (const handle of handles) {
      const entity = {handle: handle, syllables: this.toSyllables(handle.name)};
      const rimes = entity.syllables.map((s) => s.rime).filter((r) => r.length > 0);
      for (const rime of rimes) {
        if (!this.rimeIndex[rime]) {
          this.rimeIndex[rime] = [];
        }
        this.rimeIndex[rime].push(entity);
      }
    }
  }

  get id() { return 'eye-rhyme'; }

  check(name) {
    const syllables = this.toSyllables(name);
    if (syllables.length === 0) {
      return syllables;
    }
    const rhymes = new Map();
    for (const syllable of syllables.filter((s) => s.rime in this.rimeIndex)) {
      for (const handle of this.rimeIndex[syllable.rime].map((e) => e.handle)) {
        if (rhymes.has(handle)) {
          rhymes.set(handle, rhymes.get(handle) + 1);
        } else {
          rhymes.set(handle, 1);
        }
      }
    }
    const result = [];
    rhymes.forEach((count, handle) => {
      // TODO consider rhyming syllable position
      // TODO if there's only one rhyming syllable in two long names, don't complain
      const description = (count === 1)
        ? `has a syllable rhyming with ${handle.name}`
        : `shares ${count} rhyming syllables with ${handle.name}`;
      result.push(new HandleConflict(name, description, 'medium', this.id, handle));
    });
    return result;
  }

  toSyllables(text) {
    text = text.trim();
    if (text.length === 0) {
      return [];
    }
    const syllables = [];
    // Split words on non-alphanumeric, CamelCase, and numbers
    // Probably does the wrong thing with non-ascii letters
    const words = text.split(/[\W_]+/)
      .filter((word) => word.length > 0)
      // Capturing group keeps match contents as delimiters
      .map((word) => word.split(/([A-Z][a-z]*|\d+)/).filter((s) => s.length > 0))
      .reduce((a, b) => a.concat(b), []);
    words.forEach((word) => {
      word = word.toLowerCase();
      if (!word.match(/[a-z]/)) { // all numeric or something
        return;
      }
      // Work backwards, consume silent e, then coda, then nucleus, then onset.
      // If onset is preceeded by more than one cluster, pick the optimal
      // coda/onset breaking point.
      const clusters = word.split(/([aeiouy]+|[^aeiouy]+)/)
        .filter((s) => s.length > 0);
      while (clusters.length > 0) {
        // TODO to preserve order, make the loop return an array and use shift
        let onset = '';
        let nucleus = '';
        let coda = '';
        if (clusters.length === 1) {
          // Single cluster of either vowels or consonants
          const rime = clusters.pop();
          [nucleus, coda] = this.vowelsOnly(rime) ? [rime, ''] : ['', rime];
          syllables.push(new Syllable(onset, nucleus, coda));
          continue;
        }
        // English orthography: assume an e after a consonant is silent if there's a preceding vowel
        let silentEnding = '';
        if (clusters.length > 2 && clusters[clusters.length - 1] === 'e') {
          silentEnding = clusters.pop();
        }
        if (this.vowelsOnly(clusters[clusters.length - 1])) {
          nucleus = clusters.pop();
        } else {
          coda = clusters.pop();
          nucleus = clusters.pop();
          if (!this.vowelsOnly(nucleus)) {
            throw new Error(`Unexpected consonant nucleus in ${word}`);
          }
        }
        if (clusters.length === 1) {
          onset = clusters.pop();
          if (this.vowelsOnly(onset)) {
            throw new Error(`Unexpected vowel onset in ${word}`);
          }
        } else if (clusters.length > 2) {
          const split = this.splitConsonants(clusters.pop());
          onset = split[1];
          if (split[0].length > 0) {
            clusters.push(split[0]); // coda for next round
          }
        }
        syllables.push(new Syllable(onset, nucleus, coda, silentEnding));
      }
    }); // each word
    return syllables;
  }

  splitConsonants(s) {
    if (s.length === 0 || this.vowelsOnly(s)) {
      throw new Error(`Expected consonants, got ${s}`);
    }
    if (s.length === 1) {
      // TODO take surrounding clusters into account
      return ['', s];
    }
    // TODO determine likelihood based on consonate cooccurrence frequencies
    const splitPoint = Math.round(s.length / 2);
    return [s.substring(0, splitPoint), s.substring(splitPoint)];
  }

  vowelsOnly(s) { return !!s.match(/^[aeiouy]+$/); }
}
