export interface UserSignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  org: {
    name: string;
  };
}