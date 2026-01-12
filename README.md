# Kumunzee - Village Bank System

A community savings and loan management system built with SvelteKit and PostgreSQL.

## Features

### Admin Features (Treasurer)
- Dashboard with key metrics (total savings, active loans, outstanding balance)
- Member management (add new members)
- Record monthly savings (for all members including self)
- Disburse loans with automatic interest calculation (15% flat)
- Record loan repayments with automatic interest distribution
- **Month-End Process**:
  - Verification checklist (ensures all members have saved)
  - Record penalties for members
  - Process month-end to distribute penalties (with 15% interest, split equally among all members)
  - Automatic admin fee deduction (K50/month per member)
  - View month-end summary report for closed months
- View all transactions and member data
- **Admins can also participate as regular members** - they can have savings, take loans, and earn interest just like other members

### Member Features
- Personal dashboard showing:
  - Total equity (savings + interest earned + penalty share - admin fees)
  - Net position (equity - outstanding loans)
  - Outstanding loans
  - Recent savings history
  - Recent interest earned
  - Monthly distributions (penalty share minus admin fee)
- View all personal loans with repayment history

## Tech Stack

- **Framework**: SvelteKit
- **Database**: PostgreSQL 16 (Docker)
- **DB Client**: postgres.js (no ORM)
- **Styling**: Tailwind CSS
- **Auth**: Session-based (phone + 4-digit PIN)

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- Docker Desktop (for PostgreSQL)
- npm

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Start Docker Desktop

Make sure Docker Desktop is running on your machine.

### 3. Start PostgreSQL Database

\`\`\`bash
docker compose up -d
\`\`\`

This will:
- Pull the PostgreSQL 16 Alpine image
- Create a database named `kumunzee`
- Run the initialization script (`db/init.sql`) to create all tables
- Start the database on port 5432

### 4. Seed the Database with Test Data

\`\`\`bash
npm run db:seed
\`\`\`

This creates 5 demo accounts:
- **Admin**: Grace Mwamba - `+260971234567` / PIN: `1234`
- **Member**: John Banda - `+260971111111` / PIN: `1111`
- **Member**: Mary Phiri - `+260972222222` / PIN: `2222`
- **Member**: Peter Zulu - `+260973333333` / PIN: `3333`
- **Member**: Sarah Tembo - `+260974444444` / PIN: `4444`

Sample data includes:
- Savings for December 2025 and January 2026 (all members including admin, K500+ each)
- Two active loans
- One repayment transaction

### 5. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

The application will be available at `http://localhost:5173`

## Project Structure

\`\`\`
kumunzee/
├── src/
│   ├── routes/
│   │   ├── (member)/          # Member pages (dashboard, my-loans)
│   │   ├── admin/             # Admin pages (all management features)
│   │   ├── api/               # API endpoints
│   │   │   ├── auth/          # Login/logout
│   │   │   ├── members/       # Member management
│   │   │   ├── savings/       # Savings records
│   │   │   └── loans/         # Loan disbursement and repayments
│   │   └── login/             # Login page
│   ├── lib/
│   │   ├── db.js              # PostgreSQL connection
│   │   ├── auth.js            # Session management
│   │   └── calc.js            # Business logic & calculations
│   └── app.css                # Tailwind imports
├── db/
│   ├── init.sql               # Database schema
│   └── seed.js                # Test data seeder
├── docker-compose.yml         # PostgreSQL setup
└── .env                       # Environment variables
\`\`\`

## Business Rules

### Savings
- **Minimum Savings**: K500 per month per member

### Interest Calculation
- **Rate**: 15% flat, one-time at disbursement
- **Formula**: `interest = principal × 0.15`
- **Total Amount**: `principal + interest`

### Interest Distribution
When a loan repayment is made, interest is distributed to ALL members proportionally based on their savings in the month when the loan was disbursed:

\`\`\`
interest_pool = repayment_amount × 0.15
member_share = (member_savings / total_savings) × interest_pool
\`\`\`

**This happens automatically on every repayment** - no manual batch processing required.

### Loan Repayments
- Minimum payment: 10% of total loan amount
- Members can repay any amount up to the outstanding balance
- Interest is automatically distributed on each repayment

### Month-End Process
At the end of each month, the treasurer runs the month-end process which:

1. **Penalty Distribution**: Penalties are distributed with 15% interest, split equally among ALL members
   \`\`\`
   penalty_with_interest = total_penalties × 1.15
   share_per_member = penalty_with_interest / member_count
   \`\`\`

2. **Admin Fee**: K50/month is deducted from each member

3. **Net Distribution**: Each member receives:
   \`\`\`
   net_distribution = penalty_share - admin_fee
   \`\`\`
   This can be positive (if penalty share > K50) or negative (if penalty share < K50)

4. **Month Closure**: Once processed, the month is marked as closed and cannot be modified

### Member Equity
\`\`\`
total_equity = savings + interest_earned + penalty_distributions_total
net_position = total_equity - outstanding_loans
\`\`\`

Note: `penalty_distributions_total` is the sum of all monthly distributions (penalty share minus admin fee), which can be positive or negative.

## Database Tables

- `members` - User accounts (admin and members)
- `savings` - Monthly savings contributions
- `loans` - Loan records with disbursement details
- `loan_repayments` - Repayment transactions
- `interest_distributions` - Interest earned by each member
- `penalties` - Penalties assessed (future feature)
- `penalty_distributions` - Penalty distributions (future feature)
- `sessions` - User sessions for authentication

## Useful Commands

\`\`\`bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build

# Database
docker compose up -d     # Start database
docker compose down      # Stop database
npm run db:seed          # Seed with test data

# Type checking
npm run check            # Run TypeScript checks
\`\`\`

## Testing the Application

1. **Login as Admin**: Use `+260971234567` / PIN `1234`
   - View dashboard with all statistics
   - Add a new member
   - Record savings for the current month
   - Disburse a loan
   - Record a loan repayment (observe automatic interest distribution)
   - Go to Month-End tab:
     - View verification checklist
     - Record penalties (if any)
     - Process month-end (penalties distributed, admin fees deducted)
     - View month-end summary report

2. **Login as Member**: Use `+260971111111` / PIN `1111`
   - View personal dashboard with equity summary
   - Check "My Loans" to see loan details and repayment history
   - View monthly distributions (penalty share minus admin fee)

## Environment Variables

Create a `.env` file (already created):

\`\`\`env
DATABASE_URL=postgres://kumunzee_user:kumunzee_pass@localhost:5432/kumunzee
SESSION_SECRET=dev-secret-change-in-production-12345
\`\`\`

**Note**: Change the `SESSION_SECRET` in production!

## Future Enhancements

- Export reports to PDF/Excel
- SMS notifications for loan repayments and month-end
- Mobile app (React Native/Flutter)
- Multi-currency support
- Loan approval workflow
- Automated reminders for members who haven't saved
- Historical reports and analytics dashboard

## License

Private project for village bank management.
