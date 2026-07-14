interface DecodedToken {
  sub: string;
  role: string;
  exp: number;
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}