import { helper } from '@ember/component/helper';
import { htmlSafe }from '@ember/template';

export default helper(function teamTitle(positional) {
  const team = positional[0];

  if (!team) {
    return 'NULL';
  }

  let {title} = team;

  let suffix = team.active ? '' : ' <span class="text-muted">[inactive]</span>';

  return htmlSafe(`${title}${suffix}`);
});
