import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import sql from './db.js';

/**
 * Generate a random session ID
 * @returns {string} Random session ID
 */
function generateSessionId() {
	return randomBytes(32).toString('hex');
}

/**
 * Create a new session for a member
 * @param {number} memberId - Member ID
 * @returns {Promise<string>} Session ID
 */
export async function createSession(memberId) {
	const sessionId = generateSessionId();
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

	await sql`
		INSERT INTO sessions (id, member_id, expires_at)
		VALUES (${sessionId}, ${memberId}, ${expiresAt})
	`;

	return sessionId;
}

/**
 * Get session and member data
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object|null>} Member data or null if invalid
 */
export async function getSession(sessionId) {
	if (!sessionId) return null;

	const [session] = await sql`
		SELECT
			s.id as session_id,
			s.expires_at,
			m.id,
			m.name,
			m.phone,
			m.role
		FROM sessions s
		JOIN members m ON s.member_id = m.id
		WHERE s.id = ${sessionId}
			AND s.expires_at > NOW()
	`;

	return session || null;
}

/**
 * Delete a session (logout)
 * @param {string} sessionId - Session ID
 */
export async function deleteSession(sessionId) {
	if (!sessionId) return;

	await sql`
		DELETE FROM sessions
		WHERE id = ${sessionId}
	`;
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions() {
	await sql`
		DELETE FROM sessions
		WHERE expires_at < NOW()
	`;
}

/**
 * Verify login credentials
 * @param {string} phone - Phone number
 * @param {string} pin - PIN
 * @returns {Promise<Object|null>} Member data or null if invalid
 */
export async function verifyCredentials(phone, pin) {
	const [member] = await sql`
		SELECT id, name, phone, pin_hash, role
		FROM members
		WHERE phone = ${phone}
	`;

	if (!member) return null;

	const isValid = await bcrypt.compare(pin, member.pin_hash);
	if (!isValid) return null;

	return {
		id: member.id,
		name: member.name,
		phone: member.phone,
		role: member.role
	};
}

/**
 * Hash a PIN for storage
 * @param {string} pin - Plain text PIN
 * @returns {Promise<string>} Hashed PIN
 */
export async function hashPin(pin) {
	return bcrypt.hash(pin, 10);
}
