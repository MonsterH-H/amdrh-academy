// Auth module - backward-compatible re-exports
export { LoginPage } from "./components/login-form";
export { RegisterPage } from "./components/register-form";
export { ForgotPasswordPage } from "./components/forgot-password-form";
export { ResetPasswordPage } from "./components/reset-password-form";

// Types (used internally by auth components)
export type {
  LoginFormState,
  RegisterStep1,
  RegisterStep2,
  RegisterFormState,
  ForgotPasswordFormState,
  ResetPasswordFormState,
  PasswordRule,
  DemoAccount,
  RoleOption,
} from "./types";
