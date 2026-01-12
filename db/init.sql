-- Kumunzee Village Bank Database Schema
-- PostgreSQL database initialization script

-- Create members table
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'member')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create savings table
CREATE TABLE IF NOT EXISTS savings (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
    month DATE NOT NULL, -- Always first day of month (e.g., 2025-01-01)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(member_id, month) -- One savings record per member per month
);

-- Create loans table
CREATE TABLE IF NOT EXISTS loans (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    principal DECIMAL(12, 2) NOT NULL CHECK (principal > 0),
    interest DECIMAL(12, 2) NOT NULL CHECK (interest >= 0),
    total_amount DECIMAL(12, 2) NOT NULL CHECK (total_amount >= principal),
    outstanding_balance DECIMAL(12, 2) NOT NULL CHECK (outstanding_balance >= 0),
    disbursement_month DATE NOT NULL, -- First day of month when loan was disbursed
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paid', 'defaulted')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create loan_repayments table
CREATE TABLE IF NOT EXISTS loan_repayments (
    id SERIAL PRIMARY KEY,
    loan_id INTEGER NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    payment_month DATE NOT NULL, -- First day of month when payment was made
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create interest_distributions table
CREATE TABLE IF NOT EXISTS interest_distributions (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    loan_month DATE NOT NULL, -- Month when the loan was disbursed
    repayment_month DATE NOT NULL, -- Month when the repayment was made
    amount DECIMAL(12, 4) NOT NULL CHECK (amount >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create penalties table
CREATE TABLE IF NOT EXISTS penalties (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    month DATE NOT NULL, -- First day of month when penalty was assessed
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create penalty_distributions table
CREATE TABLE IF NOT EXISTS penalty_distributions (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    month DATE NOT NULL, -- Month of distribution
    amount DECIMAL(12, 4) NOT NULL, -- Can be negative when admin fee > penalty share
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sessions table for authentication
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(255) PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_savings_member_month ON savings(member_id, month);
CREATE INDEX IF NOT EXISTS idx_loans_member ON loans(member_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loan_repayments_loan ON loan_repayments(loan_id);
CREATE INDEX IF NOT EXISTS idx_interest_dist_member ON interest_distributions(member_id);
CREATE INDEX IF NOT EXISTS idx_sessions_member ON sessions(member_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- Output success message
\echo 'Database schema created successfully!'
