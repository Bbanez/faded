import { createMjmlPage } from '@becomes/mjml';
import { Config } from '@faded/config';

export interface EmailForgotPasswordData {
  firstName: string;
  lastName: string;
  query: string;
}

export const forgotPassword = createMjmlPage<EmailForgotPasswordData>({
  html: (vars) => `
  <mjml>
    <mj-body>
      <mj-wrapper>
        <mj-section>
          <mj-column>
            <mj-text>Hello ${vars.firstName} ${vars.lastName}</mj-text>
            <mj-text>If you want to restart your password click on the link below.</mj-text>
            <mj-text>
              <a href="${Config.uiOrigin}/reset-password?d=${vars.query}" target="_black">Reset password</a>
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-wrapper>
    </mj-body>
  </mjml>
  `,
});
