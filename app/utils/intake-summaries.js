export const INTAKE_TEAMS = [
  { key: 'personnel', label: 'Personnel', field: 'personnel_team' },
  { key: 'rrn',       label: 'RRN',       field: 'rrn_team' },
  { key: 'vc',        label: 'VC',        field: 'vc_team' },
  { key: 'training',  label: 'Training',  field: null },
  { key: 'mentor',    label: 'Mentor',    field: 'mentor_team' },
];

// Worst rank dominates; 4 beats 3 beats 1 beats 2.
const RANK_SEVERITY = { 4: 4, 3: 3, 1: 2, 2: 1 };

function latestFromTeam(entries) {
  if (!entries || entries.length === 0) {
    return { year: null, rank: null };
  }
  const ranked = entries.filter((e) => +e.rank > 0);
  if (ranked.length === 0) {
    return { year: null, rank: null };
  }
  const latest = ranked.slice().sort((a, b) => b.year - a.year)[0];
  return { year: latest.year, rank: +latest.rank };
}

function latestTraining(trainings) {
  if (!trainings || trainings.length === 0) {
    return { year: null, rank: null };
  }
  const ranked = trainings.filter((t) => t.slot_has_ended && +t.training_rank > 0);
  if (ranked.length === 0) {
    return { year: null, rank: null };
  }
  const latest = ranked.slice().sort((a, b) => new Date(b.slot_begins) - new Date(a.slot_begins))[0];
  const year = new Date(latest.slot_begins).getFullYear();
  return { year, rank: +latest.training_rank };
}

export function summarizeTeams(person) {
  return INTAKE_TEAMS.map((team) => {
    const latest = team.key === 'training'
      ? latestTraining(person.trainings)
      : latestFromTeam(person[team.field]);
    return { ...team, ...latest };
  });
}

// Returns the highest-severity rank present across all teams, or null.
export function worstRank(person) {
  let worst = null;
  for (const summary of summarizeTeams(person)) {
    if (!summary.rank) continue;
    if (worst === null || RANK_SEVERITY[summary.rank] > RANK_SEVERITY[worst]) {
      worst = summary.rank;
    }
  }
  return worst;
}

// Severity-sorted slug ('flag' | 'yellow' | 'green' | 'normal' | null) for CSS class hooks.
export function severitySlug(rank) {
  switch (rank) {
    case 4: return 'flag';
    case 3: return 'yellow';
    case 1: return 'green';
    case 2: return 'normal';
    default: return null;
  }
}

// Most recent year a person was bonked BY the mentors (status === 'bonk',
// NOT 'self-bonk'), or null if never. Coerces year to a number since
// mentor_history years may arrive as numeric or string.
export function mentorBonkYear(person) {
  const history = person?.mentor_history;
  let latest = null;

  if (!Array.isArray(history) || history.length === 0) {
    if (person.pnv_history) {
      Object.keys(person.pnv_history).forEach((event) => {
        const year = person.pnv_history[event];
        if (year.mentor_status === 'bonk') {
          if (latest === null || event > latest) {
            latest = event;
          }
        }
      });
    }

    return latest;
  }

  for (const entry of history) {
    if (!entry || entry.status !== 'bonk') {
      continue;
    }
    const year = +entry.year;
    if (!Number.isFinite(year)) {
      continue;
    }
    if (latest === null || year > latest) {
      latest = year;
    }
  }
  return latest;
}

// Numeric weight for sorting people worst-first. A raised Personnel flag
// outranks everything, then 4 > 3 > 1 > 2, then people with no rank.
export function severityWeight(person) {
  if (person.personnel_issue) {
    return 100;
  }
  const worst = worstRank(person);
  return worst ? RANK_SEVERITY[worst] : 0;
}
