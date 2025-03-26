CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  age INTEGER NOT NULL,
  address TEXT,
  phone_number TEXT,
  purpose TEXT,
  medication TEXT,
  gender TEXT,
  registered DATE,
  diagnosis TEXT,
  balance NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);