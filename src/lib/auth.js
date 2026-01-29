import { SignJWT, jwtVerify } from 'jose';
import { cookies } from "next/headers";


const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Create JWT token
export async function createToken(payload, expiresIn = '24h') {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .sign(JWT_SECRET);
}

// Verify JWT token
export async function verifyToken(tokenParam = null) {
  try {
    let token = tokenParam;

    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get("token")?.value;
    }

    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}