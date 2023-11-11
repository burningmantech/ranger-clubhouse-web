export function buildBroadcastOptions(positions) {
  const teamsById = {};
  const general = [];
  // Build up the basic position options
  positions.forEach((p) => {
    if (p.team_id) {
      teamsById[p.team_id] ||= {
        groupName: p.team_title,
        options: []
      }
      teamsById[p.team_id].options.push([p.title, p.id]);
    } else {
      general.push([p.title, p.id]);
    }
  });

  const options = Object.keys(teamsById).map((teamId) => teamsById[teamId]);
  options.sort((a, b) => a.groupName.localeCompare(b.groupName));
  if (general.length) {
    options.unshift({
      groupName: 'General Positions',
      options: general
    });
  }
  options.unshift(['----', null]);

  return options;
}
