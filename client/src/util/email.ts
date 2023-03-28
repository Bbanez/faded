export function isEmailValid(email: string): boolean {
  if (email.trim().replace(/ /g, '') === '') {
    return false;
  }
  const emailParts = email.split('@');
  if (emailParts.length !== 2) {
    return false;
  }
  const domainParts = emailParts[1].split('.');
  if (domainParts.length < 2) {
    return false;
  }
  return true;
}
