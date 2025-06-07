export interface User {
  username: string;
  role: string;
}

export interface JwtPayload {
  sub: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

