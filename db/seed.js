import postgres from 'postgres';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const sql = postgres(process.env.DATABASE_URL);

async function seed() {
	try {
		console.log('🌱 Seeding database...');

		// Hash PINs for demo accounts
		// Admin PIN: 1234
		// Member PINs: 1111, 2222, 3333, 4444
		const adminPinHash = await bcrypt.hash('1234', 10);
		const member1PinHash = await bcrypt.hash('1111', 10);
		const member2PinHash = await bcrypt.hash('2222', 10);
		const member3PinHash = await bcrypt.hash('3333', 10);
		const member4PinHash = await bcrypt.hash('4444', 10);

		// Insert members
		console.log('Creating members...');
		await sql`
			INSERT INTO members (name, phone, pin_hash, role)
			VALUES
				('Grace Mwamba', '+260971234567', ${adminPinHash}, 'admin'),
				('John Banda', '+260971111111', ${member1PinHash}, 'member'),
				('Mary Phiri', '+260972222222', ${member2PinHash}, 'member'),
				('Peter Zulu', '+260973333333', ${member3PinHash}, 'member'),
				('Sarah Tembo', '+260974444444', ${member4PinHash}, 'member')
			ON CONFLICT (phone) DO NOTHING
		`;

		// Get member IDs
		const members = await sql`SELECT id, name, role FROM members ORDER BY id`;
		console.log(`✓ Created ${members.length} members`);

		// Insert savings for December 2025 and January 2026 (minimum K500 per member)
		// Including admin since admins can also participate as regular members
		console.log('Adding savings records...');
		await sql`
			INSERT INTO savings (member_id, amount, month)
			VALUES
				(${members[0].id}, 500.00, '2025-12-01'),
				(${members[1].id}, 500.00, '2025-12-01'),
				(${members[2].id}, 600.00, '2025-12-01'),
				(${members[3].id}, 550.00, '2025-12-01'),
				(${members[4].id}, 500.00, '2025-12-01'),
				(${members[0].id}, 500.00, '2026-01-01'),
				(${members[1].id}, 500.00, '2026-01-01'),
				(${members[2].id}, 650.00, '2026-01-01'),
				(${members[3].id}, 550.00, '2026-01-01'),
				(${members[4].id}, 500.00, '2026-01-01')
			ON CONFLICT (member_id, month) DO NOTHING
		`;
		console.log('✓ Added savings records');

		// Insert loans (disbursed in December 2025)
		console.log('Creating loans...');
		// Loan 1: John Banda - K2000 loan
		// Principal: 2000, Interest: 300 (15%), Total: 2300
		await sql`
			INSERT INTO loans (member_id, principal, interest, total_amount, outstanding_balance, disbursement_month, status)
			VALUES
				(${members[1].id}, 2000.00, 300.00, 2300.00, 2300.00, '2025-12-01', 'active')
		`;

		// Loan 2: Peter Zulu - K1500 loan
		// Principal: 1500, Interest: 225 (15%), Total: 1725
		await sql`
			INSERT INTO loans (member_id, principal, interest, total_amount, outstanding_balance, disbursement_month, status)
			VALUES
				(${members[3].id}, 1500.00, 225.00, 1725.00, 1725.00, '2025-12-01', 'active')
		`;

		const loans = await sql`SELECT id, member_id, principal, total_amount FROM loans`;
		console.log(`✓ Created ${loans.length} loans`);

		// Insert a repayment for John's loan in January 2026
		console.log('Adding loan repayments...');
		const johnLoan = loans.find((l) => l.member_id === members[1].id);
		if (johnLoan) {
			await sql`
				INSERT INTO loan_repayments (loan_id, amount, payment_month)
				VALUES
					(${johnLoan.id}, 500.00, '2026-01-01')
			`;

			// Update loan outstanding balance
			await sql`
				UPDATE loans
				SET outstanding_balance = outstanding_balance - 500.00
				WHERE id = ${johnLoan.id}
			`;
			console.log('✓ Added repayment record');
		}

		console.log('');
		console.log('✅ Database seeded successfully!');
		console.log('');
		console.log('Demo accounts:');
		console.log('  Admin: Grace Mwamba - +260971234567 / PIN: 1234');
		console.log('  Member: John Banda - +260971111111 / PIN: 1111');
		console.log('  Member: Mary Phiri - +260972222222 / PIN: 2222');
		console.log('  Member: Peter Zulu - +260973333333 / PIN: 3333');
		console.log('  Member: Sarah Tembo - +260974444444 / PIN: 4444');
		console.log('');

		await sql.end();
	} catch (error) {
		console.error('Error seeding database:', error);
		process.exit(1);
	}
}

seed();
