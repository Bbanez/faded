
export interface AccountsTemplate {
  title: string;
  slug: string;
  email_hash: string;
  password_hash: string;
  verified?: boolean;
  otp?: string;
}