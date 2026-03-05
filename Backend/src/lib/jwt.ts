import { UserJwtPayload } from '@/modules/auth/auth.dto';
import { env } from 'bun';
import * as jose from 'jose';

const JWT_SECRET = env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET não está definido nas variáveis de ambiente');
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

export const generateToken = async (payload: UserJwtPayload): Promise<string> => {
    const token = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(env.JWT_EXPIRES_IN || '7d')
        .sign(secretKey);

    return token;
}

export const verifyToken = async (token: string): Promise<UserJwtPayload> => {
    try {
        const { payload } = await jose.jwtVerify(token, secretKey);
        return payload as UserJwtPayload;
    } catch (error) {
        throw new Error('Token inválido ou expirado');
    }
}