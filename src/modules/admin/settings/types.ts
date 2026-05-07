export interface PlatformSettings {
  name: string;
  description: string;
  contactEmail: string;
  frmhbPartnership: string;
  academicYear: string;
}

export interface AppearanceSettings {
  primaryColor: string;
  logoUrl: string;
  faviconUrl: string;
  customCSS: string;
}

export interface EmailSettings {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  encryption: string;
}

export interface SecuritySettings {
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
}

export interface LearningSettings {
  defaultPassingScore: number;
  maxQuizAttempts: number;
  certificateValidity: number;
  badgeCriteria: string;
  autoEnrollment: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  notificationRetention: number;
}

export interface AllSettings {
  platform: PlatformSettings;
  appearance: AppearanceSettings;
  email: EmailSettings;
  security: SecuritySettings;
  learning: LearningSettings;
  notifications: NotificationSettings;
}
