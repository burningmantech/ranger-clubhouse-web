import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';

const PERSONNEL_WEIGHT = 100;

function worstMentorRank(person) {
  return (person.mentor_team ?? []).reduce((max, info) => Math.max(max, info.rank ?? 0), 0);
}

// "Problematic": a raised Personnel flag or a mentor Rank 3/4 note.
function isProblematic(person) {
  return person.personnel_issue || person.have_mentor_flags;
}

// Orders the problematic group worst-first: Personnel flag, then Rank 4, then Rank 3.
function problematicWeight(person) {
  if (person.personnel_issue) {
    return PERSONNEL_WEIGHT;
  }

  return worstMentorRank(person) * 10; // 4 -> 40, 3 -> 30
}

function byCallsign(a, b) {
  return a.callsign.localeCompare(b.callsign);
}

export default class MentorAlphaStatusController extends ClubhouseController {
  @tracked filter = 'all';
  @tracked mentees;
  @tracked collapsedTrained = false;
  @tracked collapsedUntrained = false;

  filterOptions = [
    ['All', 'all'],
    ['Status eligible', 'status'],
    ['Alpha status', 'alpha'],
    [' Mentor Flagged', 'mentor-flag']
  ];

  get viewPotentials() {
    const mentees = this.mentees;

    switch (this.filter) {
      case 'status':
        return mentees.filter((p) => p.trained && !p.is_alpha);

      case 'alpha':
        return mentees.filter((p) => p.is_alpha);

      case 'mentor-flag':
        return mentees.filter((p) => p.have_mentor_flags);

      default:
        return mentees;
    }
  }

  // Section 1 — problematic individuals (Personnel flag or mentor Rank 3/4), worst-first.
  @cached
  get problematicPotentials() {
    return this.viewPotentials
      .filter(isProblematic)
      .sort((a, b) => problematicWeight(b) - problematicWeight(a) || byCallsign(a, b));
  }

  // Section 2 — trained but not yet converted to Alpha (and not problematic).
  @cached
  get trainedPotentials() {
    return this.viewPotentials
      .filter((p) => !isProblematic(p) && p.trained)
      .sort(byCallsign);
  }

  // Section 3 — not yet trained (and not problematic).
  @cached
  get untrainedPotentials() {
    return this.viewPotentials
      .filter((p) => !isProblematic(p) && !p.trained)
      .sort(byCallsign);
  }

  // Drives the rendered, ordered list of titled sections. A section is omitted
  // entirely when it has no members.
  @cached
  get sections() {
    const sections = [];

    if (this.problematicPotentials.length) {
      sections.push({
        key: 'problematic',
        title: 'Rank 3/4 Note or Personnel Flag',
        people: this.problematicPotentials,
        isAttention: true,
        collapsible: false,
        collapsed: false
      });
    }

    if (this.trainedPotentials.length) {
      sections.push({
        key: 'trained',
        title: 'Trained And Alpha Status Indication',
        people: this.trainedPotentials,
        isAttention: false,
        collapsible: true,
        collapsed: this.collapsedTrained
      });
    }

    if (this.untrainedPotentials.length) {
      sections.push({
        key: 'untrained',
        title: 'Not Yet Trained',
        people: this.untrainedPotentials,
        isAttention: false,
        collapsible: true,
        collapsed: this.collapsedUntrained
      });
    }

    return sections;
  }

  @action
  toggleSection(key) {
    if (key === 'trained') {
      this.collapsedTrained = !this.collapsedTrained;
    } else if (key === 'untrained') {
      this.collapsedUntrained = !this.collapsedUntrained;
    }
  }

  get statusEligibleCount() {
    return this.mentees.reduce((total, p) => (p.is_trained ? 1 : 0) + total, 0);
  }

  get alphaCount() {
    return this.mentees.reduce((total, p) => (p.status === 'alpha' ? 1 : 0) + total, 0);
  }
}
