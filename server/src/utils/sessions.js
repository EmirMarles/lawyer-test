import { randomUUID } from 'crypto';

const sessions = new Map();

export function createSession(questions) {
    const sessionId = randomUUID();
    sessions.set(sessionId, { questions, createdAt: Date.now() });
    return sessionId;
}

export function getSession(sessionId) {
    return sessions.get(sessionId);
}

export function deleteSession(sessionId) {
    sessions.delete(sessionId);
}
