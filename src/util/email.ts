export function emailValidation(email: string): boolean {
  const mainParts = email.split('@');
  if (mainParts.length !== 2) {
    return false;
  }
  const domainParts = mainParts[1].split('.');
  if (domainParts.length < 2) {
    return false;
  }
  return true;
}
