import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-insecure-secret-change-me",
);
const issuer = "food-delivery-api";

export async function signToken(
  sub: string,
  extra: Record<string, unknown> = {},
): Promise<string> {
  return new SignJWT(extra)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub)
    .setIssuer(issuer)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret, { issuer });
  return payload;
}
