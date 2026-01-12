// Seed script with real data from Social Shareholders spreadsheet
import 'dotenv/config';
import postgres from 'postgres';
import bcrypt from 'bcrypt';

const DATABASE_URL = process.env.DATABASE_URL;
const sql = postgres(DATABASE_URL, { max: 1 });

async function seedRealData() {
	try {
		console.log('🌱 Seeding database with real Social Shareholders data...');

		// Clear existing data
		console.log('Clearing existing data...');
		await sql`DELETE FROM interest_distributions`;
		await sql`DELETE FROM loan_repayments`;
		await sql`DELETE FROM loans`;
		await sql`DELETE FROM savings`;
		await sql`DELETE FROM penalty_distributions`;
		await sql`DELETE FROM penalties`;
		await sql`DELETE FROM sessions`;
		await sql`DELETE FROM members`;

		// Create members
		console.log('Creating 13 members from spreadsheet...');
		const members = [
			{ name: 'Aibaki Tembo', phone: '+260971000001', pin: '1111' },
			{ name: 'Brian Chirwa', phone: '+260971000002', pin: '2222' },
			{ name: 'Chilu Nyendwa', phone: '+260971000003', pin: '3333' },
			{ name: 'Clive Makala', phone: '+260971000004', pin: '4444' },
			{ name: 'David Machungwa', phone: '+260971000005', pin: '5555' },
			{ name: 'Kababa Kangwa', phone: '+260971000006', pin: '6666' },
			{ name: 'Kalenga Kamwendo', phone: '+260971000007', pin: '7777' },
			{ name: 'Kote Nikoi', phone: '+260971000008', pin: '8888' },
			{ name: 'Kunda Maliti', phone: '+260971000009', pin: '9999' },
			{ name: 'Mapenzi Mweetwa', phone: '+260971000010', pin: '1010' },
			{ name: 'Musamba Karabasis', phone: '+260971000011', pin: '1111' },
			{ name: 'Osward Nkhoma', phone: '+260971000012', pin: '1212' },
			{ name: 'Tiza Silavwe', phone: '+260971000013', pin: '1313' }
		];

		for (const member of members) {
			const pinHash = await bcrypt.hash(member.pin, 10);
			await sql`
				INSERT INTO members (name, phone, pin_hash, role)
				VALUES (${member.name}, ${member.phone}, ${pinHash}, 'member')
			`;
		}

		// Get member IDs
		const allMembers = await sql`SELECT id, name FROM members ORDER BY id`;
		console.log(`✓ Created ${allMembers.length} members`);

		// Helper function to get member ID by name
		const getMemberId = (name) => {
			const member = allMembers.find((m) => m.name.trim() === name.trim());
			if (!member) {
				console.warn(`Warning: Member not found: ${name}`);
				return null;
			}
			return member.id;
		};

		// Import savings data from January to September 2025
		console.log('Importing savings data...');
		const savingsData = [
			{ name: 'Aibaki Tembo', savings: [
				['2025-01-01', 1250], ['2025-02-01', 9800], ['2025-03-01', 500], ['2025-04-01', 500],
				['2025-05-01', 850], ['2025-06-01', 500], ['2025-07-01', 500], ['2025-08-01', 500], ['2025-09-01', 500]
			]},
			{ name: 'Brian Chirwa', savings: [
				['2025-01-01', 1500], ['2025-02-01', 2000], ['2025-03-01', 2000], ['2025-04-01', 2000],
				['2025-05-01', 3000], ['2025-06-01', 3000], ['2025-07-01', 500], ['2025-08-01', 500], ['2025-09-01', 1500]
			]},
			{ name: 'Chilu Nyendwa', savings: [
				['2025-01-01', 5000], ['2025-02-01', 500], ['2025-03-01', 500], ['2025-04-01', 500],
				['2025-05-01', 13500], ['2025-06-01', 500], ['2025-07-01', 500], ['2025-08-01', 1050], ['2025-09-01', 1050]
			]},
			{ name: 'Clive Makala', savings: [
				['2025-01-01', 20000], ['2025-02-01', 500], ['2025-03-01', 500], ['2025-04-01', 500],
				['2025-05-01', 500], ['2025-06-01', 3000], ['2025-07-01', 500], ['2025-08-01', 500], ['2025-09-01', 500]
			]},
			{ name: 'David Machungwa', savings: [
				['2025-01-01', 500], ['2025-02-01', 31500], ['2025-03-01', 500], ['2025-04-01', 500],
				['2025-05-01', 500], ['2025-06-01', 500], ['2025-07-01', 500], ['2025-08-01', 500], ['2025-09-01', 16350]
			]},
			{ name: 'Kababa Kangwa', savings: [
				['2025-01-01', 9250], ['2025-02-01', 20750], ['2025-03-01', 2000], ['2025-04-01', 1000],
				['2025-05-01', 2000], ['2025-06-01', 500], ['2025-07-01', 500], ['2025-08-01', 500], ['2025-09-01', 500]
			]},
			{ name: 'Kalenga Kamwendo', savings: [
				['2025-01-01', 500], ['2025-02-01', 600], ['2025-03-01', 750], ['2025-04-01', 550],
				['2025-05-01', 850], ['2025-06-01', 500], ['2025-07-01', 2850], ['2025-08-01', 1200], ['2025-09-01', 500]
			]},
			{ name: 'Kote Nikoi', savings: [
				['2025-01-01', 11000], ['2025-02-01', 500], ['2025-03-01', 500], ['2025-04-01', 550],
				['2025-05-01', 500], ['2025-06-01', 550], ['2025-07-01', 500], ['2025-08-01', 500], ['2025-09-01', 500]
			]},
			{ name: 'Kunda Maliti', savings: [
				['2025-01-01', 1000], ['2025-02-01', 7000], ['2025-03-01', 10000], ['2025-04-01', 1000],
				['2025-05-01', 1000], ['2025-06-01', 2850], ['2025-07-01', 2350], ['2025-08-01', 2000], ['2025-09-01', 1200]
			]},
			{ name: 'Mapenzi Mweetwa', savings: [
				['2025-01-01', 500], ['2025-02-01', 850], ['2025-03-01', 20000], ['2025-04-01', 500],
				['2025-05-01', 500], ['2025-06-01', 500], ['2025-07-01', 500], ['2025-08-01', 500], ['2025-09-01', 500]
			]},
			{ name: 'Musamba Karabasis', savings: [
				['2025-02-01', 9850], ['2025-03-01', 7900], ['2025-04-01', 4800],
				['2025-05-01', 5100], ['2025-06-01', 5100], ['2025-07-01', 3100], ['2025-08-01', 2200], ['2025-09-01', 3100]
			]},
			{ name: 'Osward Nkhoma', savings: [
				['2025-01-01', 500], ['2025-02-01', 1000], ['2025-03-01', 1000], ['2025-04-01', 1000],
				['2025-05-01', 1200], ['2025-06-01', 500], ['2025-07-01', 1000], ['2025-08-01', 1000], ['2025-09-01', 1000]
			]},
			{ name: 'Tiza Silavwe', savings: [
				['2025-01-01', 500], ['2025-02-01', 700], ['2025-03-01', 600], ['2025-04-01', 800],
				['2025-05-01', 600], ['2025-06-01', 700], ['2025-07-01', 600], ['2025-08-01', 700], ['2025-09-01', 800]
			]}
		];

		for (const memberData of savingsData) {
			const memberId = getMemberId(memberData.name);
			if (memberId) {
				for (const [month, amount] of memberData.savings) {
					await sql`
						INSERT INTO savings (member_id, amount, month)
						VALUES (${memberId}, ${amount}, ${month})
					`;
				}
			}
		}
		console.log('✓ Imported savings data');

		// Import loan disbursements
		console.log('Importing loan disbursements...');
		const loansData = [
			{ name: 'Aibaki Tembo', loans: [['2025-09-01', 9420]] },
			{ name: 'Brian Chirwa', loans: [['2025-04-01', 8000], ['2025-07-01', 7000], ['2025-09-01', 5000]] },
			{ name: 'Chilu Nyendwa', loans: [['2025-01-01', 10000], ['2025-05-01', 40000], ['2025-08-01', 22325]] },
			{ name: 'Clive Makala', loans: [['2025-01-01', 40000], ['2025-03-01', 5545], ['2025-06-01', 68926.75], ['2025-07-01', 5100]] },
			{ name: 'David Machungwa', loans: [['2025-02-01', 70000]] },
			{ name: 'Kababa Kangwa', loans: [['2025-02-01', 1800], ['2025-05-01', 19100]] },
			{ name: 'Kalenga Kamwendo', loans: [['2025-09-01', 50000]] },
			{ name: 'Kote Nikoi', loans: [['2025-02-01', 20000], ['2025-06-01', 10000], ['2025-07-01', 6000]] },
			{ name: 'Kunda Maliti', loans: [['2025-03-01', 55000]] },
			{ name: 'Mapenzi Mweetwa', loans: [['2025-04-01', 20000], ['2025-07-01', 6000], ['2025-08-01', 30000]] },
			{ name: 'Musamba Karabasis', loans: [['2025-07-01', 25000]] },
			{ name: 'Osward Nkhoma', loans: [['2025-04-01', 3000]] },
			{ name: 'Tiza Silavwe', loans: [['2025-01-01', 1500], ['2025-07-01', 12000]] }
		];

		for (const memberData of loansData) {
			const memberId = getMemberId(memberData.name);
			if (memberId) {
				for (const [month, principal] of memberData.loans) {
					const interest = principal * 0.15;
					const totalAmount = principal + interest;
					await sql`
						INSERT INTO loans (member_id, principal, interest, total_amount, outstanding_balance, disbursement_month, status)
						VALUES (${memberId}, ${principal}, ${interest}, ${totalAmount}, ${totalAmount}, ${month}, 'active')
					`;
				}
			}
		}

		const loans = await sql`SELECT id, member_id, principal, disbursement_month FROM loans ORDER BY id`;
		console.log(`✓ Created ${loans.length} loans`);

		// Import loan repayments (with automatic interest distribution)
		console.log('Importing loan repayments and calculating interest distributions...');

		// We'll need to process repayments in chronological order
		// For simplicity, we'll match repayments to loans based on member and approximate timing
		// This is a simplified approach - in reality you'd need more precise loan tracking

		console.log('✓ Note: Loan repayments need manual mapping to specific loan IDs');
		console.log('  Please use the admin interface to record repayments for accurate interest distribution');

		console.log('\n✅ Database seeded with real data!');
		console.log('\nLogin credentials (all have their number as PIN):');
		console.log('  Aibaki Tembo: +260971000001 / PIN: 1111');
		console.log('  Brian Chirwa: +260971000002 / PIN: 2222');
		console.log('  ... (see members array for all credentials)');

	} catch (error) {
		console.error('❌ Error seeding database:', error);
		throw error;
	} finally {
		await sql.end();
	}
}

seedRealData();
