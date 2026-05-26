import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { env } from "../config/env.js";
import { UnauthorizedError } from "../errors/customErrors.js";

export interface JwtUserPayload {
  id: number;
  email: string;
  role: string;
}

export interface AccessTokenPayload extends JwtUserPayload {
  type: "access";
}

export interface RefreshTokenPayload extends JwtUserPayload {
  type: "refresh";
  jti: string;
}

const issuer = "magia-das-velas-api";
const audience = "magia-das-velas-client";

export function signAccessToken(user: JwtUserPayload): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      type: "access",
    },
    env.JWT_SECRET,
    {
      expiresIn: "15m",
      issuer,
      audience,
    }
  );
}

export function signRefreshToken(user: JwtUserPayload): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      type: "refresh",
      jti: randomUUID(),
    },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
      issuer,
      audience,
    }
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer,
      audience,
    }) as AccessTokenPayload;

    if (decoded.type !== "access") {
      throw new UnauthorizedError("Token inválido");
    }

    return decoded;
  } catch {
    throw new UnauthorizedError("Token inválido ou expirado");
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET, {
      issuer,
      audience,
    }) as RefreshTokenPayload;

    if (decoded.type !== "refresh") {
      throw new UnauthorizedError("Refresh token inválido");
    }

    return decoded;
  } catch {
    throw new UnauthorizedError("Refresh token inválido ou expirado");
  }
}

export function getRefreshTokenExpiresAt(): Date {
  const expiresAt = new Date();

  expiresAt.setDate(expiresAt.getDate() + 7);

  return expiresAt;
}