import { createMjmlPage } from '@becomes/mjml';
import { Config } from '@faded/config';

export interface EmailVerifyAccountData {
  firstName: string;
  lastName: string;
  query: string;
}

export const verifyAccount = createMjmlPage<EmailVerifyAccountData>({
  html: (vars) => `
  <mjml>
    <mj-body>
      <mj-wrapper>
        <mj-section>
          <mj-column>
            <mj-text>Hello ${vars.firstName} ${vars.lastName}</mj-text>
            <mj-text>Please verify your email address</mj-text>
            <mj-text>
              <a href="${Config.uiOrigin}/sign-up/complete?d=${vars.query}" target="_black">Reset password</a>
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-wrapper>
    </mj-body>
  </mjml>
  `,
});
