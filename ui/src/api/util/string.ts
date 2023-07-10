export class StringUtility {
  static verifyEmail(email: string) {
    if (!email) {
      return false;
    }
    const emailParts = email.split('@');
    if (emailParts.length !== 2) {
      return false;
    }
    const domainParts = emailParts[1].split('.');
    return domainParts.filter((e) => e).length > 1;
  }
}