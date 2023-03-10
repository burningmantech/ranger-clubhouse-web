export const ADMIN = 1; // Super user! Change anything
export const VIEW_PII = 2; // See email, address, phone
export const VIEW_EMAIL = 3; // See email
export const GRANT_POSITION = 4; // Grand/Revoke Positions
export const EDIT_ACCESS_DOCS = 5; // Edit Access Documents
export const EDIT_BMIDS = 6; // Edit BMIDs
export const EDIT_SLOTS = 7; // Edit Slots
export const MANAGE = 12; // Ranger HQ: access other schedule, asset checkin/out, send messages
export const INTAKE = 13; // Intake Management
export const MENTOR = 101; // Mentor - access mentor section
export const TRAINER = 102; // Trainer
export const VC = 103; // Volunteer Coordinator
export const ART_TRAINER = 104; // ART Trainer
export const MEGAPHONE = 105; // RBS access
export const TIMESHEET_MANAGEMENT = 106;
export const SURVEY_MANAGEMENT = 107;
export const MANAGE_ON_PLAYA = 108;
export const TRAINER_SEASONAL = 109;
export const CERTIFICATION_MGMT = 110;
export const TECH_NINJA = 1000;
export const EDIT_ASSETS = 111;    // Person can create and edit asset records
export const EDIT_SWAG = 112;      // Person can create and edit swag records

export const Role = {
  ADMIN,
  ART_TRAINER,
  CERTIFICATION_MGMT,
  EDIT_ACCESS_DOCS,
  EDIT_ASSETS,
  EDIT_BMIDS,
  EDIT_SLOTS,
  EDIT_SWAG,
  GRANT_POSITION,
  INTAKE,
  MANAGE,
  MANAGE_ON_PLAYA,
  MEGAPHONE,
  MENTOR,
  SURVEY_MANAGEMENT,
  TECH_NINJA,
  TIMESHEET_MANAGEMENT,
  TRAINER,
  TRAINER_SEASONAL,
  VC,
  VIEW_EMAIL,
  VIEW_PII,
};

export const RoleToString = {
  [ADMIN]: 'admin',
  [ART_TRAINER]: 'art-trainer',
  [EDIT_ACCESS_DOCS]: 'edit-access-docs',
  [EDIT_ASSETS]: 'edit-assets',
  [EDIT_BMIDS]: 'edit-bmids',
  [EDIT_SLOTS]: 'edit-slots',
  [EDIT_SWAG]: 'edit-swag',
  [GRANT_POSITION]: 'grant-position',
  [INTAKE]: 'intake',
  [MANAGE]: 'manage',
  [MANAGE_ON_PLAYA]: 'manage-on-playa',
  [MEGAPHONE]: 'megaphone',
  [MENTOR]: 'mentor',
  [TECH_NINJA]: 'tech-ninja',
  [TIMESHEET_MANAGEMENT]: 'timesheet-management',
  [TRAINER]: 'trainer',
  [TRAINER_SEASONAL]: 'trainer-seasonal',
  [SURVEY_MANAGEMENT]: 'survey-management',
  [VC]: 'vc',
  [VIEW_EMAIL]: 'view-email',
  [VIEW_PII]: 'view-pii',
};

export const StringToRole = Object.keys(RoleToString).reduce((hash, key) => {
  key = parseInt(key);
  hash[RoleToString[key]] = key;
  return hash;
}, {});
