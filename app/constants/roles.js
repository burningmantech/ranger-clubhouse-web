const ADMIN = 1; // Super user! Change anything
const VIEW_PII = 2; // See email, address, phone
const VIEW_EMAIL = 3; // See email
const GRANT_POSITION = 4; // Grand/Revoke Positions
const EDIT_ACCESS_DOCS = 5; // Edit Access Documents
const EDIT_BMIDS = 6; // Edit BMIDs
const EDIT_SLOTS = 7; // Edit Slots
const LOGIN = 11; // Person allowed to login
const MANAGE = 12; // Ranger HQ: access other schedule, asset checkin/out, send messages
const INTAKE = 13; // Intake Management
const MENTOR = 101; // Mentor - access mentor section
const TRAINER = 102; // Trainer
const VC = 103; // Volunteer Coordinator
const ART_TRAINER = 104; // ART Trainer
const MEGAPHONE = 105; // RBS access
const TIMESHEET_MANAGEMENT = 106;
const SURVEY_MANAGEMENT = 107;

const Role = {
  ADMIN,
  ART_TRAINER,
  EDIT_ACCESS_DOCS,
  EDIT_BMIDS,
  EDIT_SLOTS,
  GRANT_POSITION,
  INTAKE,
  LOGIN,
  MANAGE,
  MEGAPHONE,
  MENTOR,
  SURVEY_MANAGEMENT,
  TIMESHEET_MANAGEMENT,
  TRAINER,
  VC,
  VIEW_EMAIL,
  VIEW_PII,
};

const RoleToString = {
  [ADMIN]: 'admin',
  [ART_TRAINER]: 'art-trainer',
  [EDIT_ACCESS_DOCS]: 'edit-access-docs',
  [EDIT_BMIDS]: 'edit-bmids',
  [EDIT_SLOTS]: 'edit-slots',
  [GRANT_POSITION]: 'grant-position',
  [INTAKE]: 'intake',
  [LOGIN]: 'login',
  [MANAGE]: 'manage',
  [MEGAPHONE]: 'megaphone',
  [MENTOR]: 'mentor',
  [TIMESHEET_MANAGEMENT]: 'timesheet-management',
  [TRAINER]: 'trainer',
  [SURVEY_MANAGEMENT]: 'survey-management',
  [VC]: 'vc',
  [VIEW_EMAIL]: 'view-email',
  [VIEW_PII]: 'view-pii',
};

const StringToRole = Object.keys(RoleToString).reduce((hash, key) => {
  key = parseInt(key);
  hash[RoleToString[key]] = key;
  return hash;
}, {});

function roleName(role) {
  return (RoleToString[role] || role);
}

export {
  roleName,
  StringToRole,
  RoleToString,
  Role
};
