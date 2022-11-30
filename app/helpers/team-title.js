import { helper } from '@ember/component/helper';
import { htmlSafe }from '@ember/template';

export default helper(function teamTitle(positional) {
  const team = positional[0];

  if (!team) {
    return 'NULL';
  }

  let {title} = team;

  let suffix = team.active ? '' : ' [inactive]';

  if (title.match(/\b(cadre|team|delegation)\b/i)) {
    return title + suffix;
  }

  return htmlSafe(`${title}${suffix} <i class="text-muted">(team)</i>`);
});
