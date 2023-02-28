export class Config {
  static readonly dbPrfx = process.env.DB_PRFX || 'faded';
  static readonly fsdb = process.env.DB_NAME || true;
  static readonly jwt = {
    issuer: process.env.JWT_ISSUER || 'localhost',
    secret: process.env.JWT_SECRET || 'secret',
    expIn: process.env.JWT_EXP_IN
      ? parseInt(process.env.JWT_EXP_IN, 10)
      : 300000,
  };
  static readonly uiOrigin = process.env.UI_ORIGIN || 'http://localhost:5000';
  static readonly mail = {
    host: process.env.EMAIL_HOST || '',
  };
  static readonly cmsOrigin =
    process.env.CMS_ORIGIN || 'https://cms.vajaga.com';
  static readonly cmsApiKeyId =
    process.env.CMS_API_KEY_ID || '636f4d9d9fab4733bcf04b49';
  static readonly cmsApiKeySecret =
    process.env.CMS_API_KEY_SECRET ||
    '8de3f809c17598582d5f06c47ccb5994002d521b7903f127eea9c98e4a6f3516';
  static readonly cmsBootsTemplate = '636e39b19fab4733bcf03c6b';
  static readonly cmsChestTemplate = '636e39209fab4733bcf03c54';
  static readonly cmsGlovesTemplate = '636e3e6d9fab4733bcf03cb4';
  static readonly cmsHelmetTemplate = '636e37b69fab4733bcf03c30';
  static readonly cmsClassTemplate = '6367d65e9fab4733bcf036d2';
  static readonly cmsRaceTemplate = '6367d6939fab4733bcf036db';
  static readonly cmsSpecializationTemplate = '6367dacd9fab4733bcf03825';
  static readonly cmsItemRarity = '636e37f99fab4733bcf03c3b';
  static readonly cmsMap = '636f4eb99fab4733bcf04b4f';
  static readonly cmsShield = '636e3a369fab4733bcf03c82';
  static readonly cmsWeapon = '636e3ace9fab4733bcf03c97';
  static readonly cmsMapStart = '63752e279fab4733bcf04b92'
}
