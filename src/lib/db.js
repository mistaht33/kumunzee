import postgres from 'postgres';
import { DATABASE_URL } from '$env/static/private';

// Create PostgreSQL connection
const sql = postgres(DATABASE_URL, {
	max: 10, // Maximum number of connections
	idle_timeout: 20,
	connect_timeout: 10
});

export default sql;
