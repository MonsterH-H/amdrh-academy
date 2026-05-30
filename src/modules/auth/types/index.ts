/** Login form state */
export interface LoginFormState {
  email: string;
  password: string;
  showPassword: boolean;
  loading: boolean;
  error: string;
}

/** Register form step 1 data */
export interface RegisterStep1 {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/** Register form step 2 data */
export interface RegisterStep2 {
  role: string;
  telephone: string;
  club: string;
  region: string;
  licenceNumber: string;
}

/** Register form state */
export interface RegisterFormState extends LoginFormState {
  step: 1 | 2;
  prenom: string;
  nom: string;
  confirmPassword: string;
  role: string;
  telephone: string;
  club: string;
  region: string;
  licenceNumber: string;
}

/** Forgot password form state */
export interface ForgotPasswordFormState {
  email: string;
  loading: boolean;
  error: string;
  sent: boolean;
  devToken: string | null;
}

/** Reset password form state */
export interface ResetPasswordFormState {
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  loading: boolean;
  error: string;
  success: boolean;
}

/** Password validation rule */
export interface PasswordRule {
  test: boolean;
  label: string;
}

/** Demo account for login */
export interface DemoAccount {
  label: string;
  email: string;
  role: string;
  password?: string;
}

/** Role option for registration */
export interface RoleOption {
  value: string;
  label: string;
  color: string;
  emoji: string;
}
