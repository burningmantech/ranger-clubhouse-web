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
export const CAN_FORCE_SHIFT = 113; // Person can force a shift check in

export const REGIONAL_MANAGEMENT = 114;    // Person can access Regional Ranger liaison features.
export const PAYROLL = 115;                // Can access payroll features
export const VEHICLE_MANAGEMENT = 116;     // Can access vehicle fleet management features
export const SHIFT_MANAGEMENT_SELF = 117;    // Paid folks who can self check in/out, and submit timesheet corrections year round.
export const SALESFORCE_IMPORT = 118;      // Allowed to import new accounts from Salesforce
export const MESSAGE_MANAGEMENT = 119;    // Allow access to Clubhouse Messages year round regardless of EMYR/EMOP setting.
export const EDIT_CLOTHING = 120;   // Can edit a clothing fields.
export const MEGAPHONE_TEAM_ONPLAYA = 121;  // On-Playa Megaphone permission
export const MEGAPHONE_EMERGENCY_ONPLAYA = 122;    // Allows access to the broadcast all emergency
export const ANNOUNCEMENT_MANAGEMENT = 123;    // Allow announcements to be created and deleted.
export const QUARTERMASTER = 124;
export const SHIFT_MANAGEMENT = 125;
export const POD_MANAGEMENT = 126;
export const AWARD_MANAGEMENT = 127; // Allows a person to grant or revoke service awards.
export const FULL_REPORT_ACCESS = 128; // Allows a person to see an unrestrict report view for reports like Timesheets By Callsign
export const EDIT_HANDLE_RESERVATIONS = 129; // Can manage the handle reservations list.

export const ROLE_BASE_MASK = 0x7f000000;
export const POSITION_MASK = 0x0fff;

export const ART_TRAINER_BASE = 0x1000000;
export const SURVEY_MANAGEMENT_BASE = 0x2000000;
export const ART_GRADUATE_BASE = 0x30000000;

export const Role = {
  ADMIN,
  ANNOUNCEMENT_MANAGEMENT,
  ART_TRAINER,
  AWARD_MANAGEMENT,
  CAN_FORCE_SHIFT,
  CERTIFICATION_MGMT,
  EDIT_ACCESS_DOCS,
  EDIT_ASSETS,
  EDIT_BMIDS,
  EDIT_CLOTHING,
  EDIT_SLOTS,
  EDIT_SWAG,
  FULL_REPORT_ACCESS,
  GRANT_POSITION,
  INTAKE,
  MANAGE,
  MANAGE_ON_PLAYA,
  MEGAPHONE,
  MEGAPHONE_EMERGENCY_ONPLAYA,
  MEGAPHONE_TEAM_ONPLAYA,
  MENTOR,
  MESSAGE_MANAGEMENT,
  PAYROLL,
  POD_MANAGEMENT,
  QUARTERMASTER,
  REGIONAL_MANAGEMENT,
  SALESFORCE_IMPORT,
  SHIFT_MANAGEMENT,
  SHIFT_MANAGEMENT_SELF,
  SURVEY_MANAGEMENT,
  TECH_NINJA,
  TIMESHEET_MANAGEMENT,
  TRAINER,
  TRAINER_SEASONAL,
  VC,
  VEHICLE_MANAGEMENT,
  VIEW_EMAIL,
  VIEW_PII,
};

export const RoleToString = {
  [ADMIN]: 'admin',
  [ANNOUNCEMENT_MANAGEMENT]: 'announcement-management',
  [ART_TRAINER]: 'art-trainer',
  [AWARD_MANAGEMENT]: 'award-management',
  [CAN_FORCE_SHIFT]: 'force-shift',
  [CERTIFICATION_MGMT]: 'certificate-management',
  [EDIT_ACCESS_DOCS]: 'edit-access-docs',
  [EDIT_ASSETS]: 'edit-assets',
  [EDIT_BMIDS]: 'edit-bmids',
  [EDIT_CLOTHING]: 'edit-clothing',
  [EDIT_SLOTS]: 'edit-slots',
  [EDIT_SWAG]: 'edit-swag',
  [FULL_REPORT_ACCESS]: 'full-report-access',
  [GRANT_POSITION]: 'grant-position',
  [INTAKE]: 'intake',
  [MANAGE]: 'manage',
  [MANAGE_ON_PLAYA]: 'manage-on-playa',
  [MEGAPHONE]: 'megaphone',
  [MEGAPHONE_EMERGENCY_ONPLAYA]: 'megaphone-emergency-onplaya',
  [MEGAPHONE_TEAM_ONPLAYA]: 'megaphone-team-onplaya',
  [MENTOR]: 'mentor',
  [MESSAGE_MANAGEMENT]: 'message-management',
  [PAYROLL]: 'payroll',
  [POD_MANAGEMENT]: 'pod-management',
  [QUARTERMASTER]: 'quartermaster',
  [REGIONAL_MANAGEMENT]: 'regional',
  [SALESFORCE_IMPORT]: 'salesforce-import',
  [SHIFT_MANAGEMENT]: 'shift-management',
  [SHIFT_MANAGEMENT_SELF]: 'timecard-year-round',
  [SURVEY_MANAGEMENT]: 'survey-management',
  [TECH_NINJA]: 'tech-ninja',
  [TIMESHEET_MANAGEMENT]: 'timesheet-management',
  [TRAINER]: 'trainer',
  [TRAINER_SEASONAL]: 'trainer-seasonal',
  [VC]: 'vc',
  [VEHICLE_MANAGEMENT]: 'vehicle',
  [VIEW_EMAIL]: 'view-email',
  [VIEW_PII]: 'view-pii',
};

export const StringToRole = Object.keys(RoleToString).reduce((hash, key) => {
  key = parseInt(key);
  hash[RoleToString[key]] = key;
  return hash;
}, {});
