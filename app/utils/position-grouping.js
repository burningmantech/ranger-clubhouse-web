// Tags the first position in a category with groupStart=true so the template
// can render the left group-divider border (roster-group-border). Shared by
// OpsTeamsManageController and TeamMembershipRowComponent so the header
// column-group borders and the body-cell borders stay aligned.
export function tagGroupStart(positions) {
  return positions.map((p, i) => ({...p, groupStart: i === 0}));
}

// Assembles the ordered, group-tagged position list from the three team
// categories. Inputs may be raw position records (controller) or
// {title, granted} cells (row component); only index/order matters here.
export function buildGroupedPositions(allMembers, optional, publicPositions) {
  return [
    ...tagGroupStart(allMembers),
    ...tagGroupStart(optional),
    ...tagGroupStart(publicPositions),
  ];
}
