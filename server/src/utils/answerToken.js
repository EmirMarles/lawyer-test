import crypto from 'crypto';

const SECRET = process.env.SESSION_SECRET || process.env.SECRET || 'lawyer-test-default-secret-change-in-production';
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function base64UrlEncode(buf) {
    return Buffer.from(buf).toString('base64url');
}

function base64UrlDecode(str) {
    return Buffer.from(str, 'base64url');
}

/**
 * Create a signed token containing the session's answer key and question data.
 * Survives server restarts; valid for 24h.
 */
export function createAnswerToken(sessionId, questions) {
    const payload = {
        sessionId,
        questions,
        exp: Date.now() + TTL_MS,
    };
    const payloadStr = JSON.stringify(payload);
    const signature = crypto.createHmac('sha256', SECRET).update(payloadStr).digest('hex');
    const encoded = base64UrlEncode(Buffer.from(payloadStr, 'utf8'));
    return `${encoded}.${signature}`;
}

/**
 * Verify token and return payload (questions + sessionId) or null if invalid/expired.
 */
export function verifyAnswerToken(token) {
    if (!token || typeof token !== 'string') return null;
    const dot = token.indexOf('.');
    if (dot === -1) return null;
    const encoded = token.slice(0, dot);
    const signature = token.slice(dot + 1);
    let payloadStr;
    try {
        payloadStr = base64UrlDecode(encoded).toString('utf8');
    } catch {
        return null;
    }
    const expectedSig = crypto.createHmac('sha256', SECRET).update(payloadStr).digest('hex');
    if (signature.length !== expectedSig.length) return null;
    try {
        if (!crypto.timingSafeEqual(Buffer.from(signature, 'utf8'), Buffer.from(expectedSig, 'utf8'))) return null;
    } catch {
        return null;
    }
    let payload;
    try {
        payload = JSON.parse(payloadStr);
    } catch {
        return null;
    }
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
}
