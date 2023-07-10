export class Config {
  static readonly origin = process.env.ORIGIN || 'http://localhost:7000';
  static readonly jwtExpIn = process.env.JWT_EXP_IN
    ? parseInt(process.env.JWT_EXP_IN, 10)
    : 60000;
  static readonly jwtIssuer = process.env.JWT_ISSUER || 'localhost';
  static readonly jwtSecret = process.env.JWT_SECRET || 'secret';
  static readonly dbUrl =
    process.env.DB_URL || 'mongodb://test:test1234@faded-db:27017/admin';
  static readonly redisUrl = process.env.REDIS_URL || 'redis://faded-redis';
  static readonly oauthGoogleClientId = process.env.GOOGLE_CLIENT_ID || '';
  static readonly oauthGoogleClientSecret =
    process.env.GOOGLE_CLIENT_SECRET || '';
  static readonly oauthGithubClientId = process.env.GOOGLE_GITHUB_ID || '';
  static readonly oauthGithubClientSecret =
    process.env.GOOGLE_GITHUB_SECRET || '';
  static readonly oauthMicrosoftClientId =
    process.env.GOOGLE_MICROSOFT_ID || '';
  static readonly oauthMicrosoftClientSecret =
    process.env.GOOGLE_MICROSOFT_SECRET || '';
}
