export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  role: 'customer' | 'admin';
  iat: number;
  exp: number;
}
