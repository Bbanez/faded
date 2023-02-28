import { MJML, EmailForgotPasswordData, EmailVerifyAccountData } from './mjml';

export class EmailSender {
  static sender = '';
  static htmls: {
    [name: string]: string;
  } = {};

  static async forgotPassword(
    data: EmailForgotPasswordData & {
      email: string;
      username: string;
    },
  ): Promise<void | Error> {
    const html = MJML.forgotPassword({
      firstName: data.firstName,
      lastName: data.lastName,
      query: data.query,
    });
    // TODO: Send email if client available
    console.log(html);
  }

  static async verifyAccount(
    data: EmailVerifyAccountData & {
      email: string;
      username: string;
    },
  ): Promise<void | Error> {
    const html = MJML.verifyAccount({
      firstName: data.firstName,
      lastName: data.lastName,
      query: data.query,
    });
    // TODO: Send email if client available
    console.log(html);
  }
}
