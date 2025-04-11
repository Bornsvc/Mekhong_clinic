-- Add case-insensitive indexes for patient search
CREATE INDEX IF NOT EXISTS patients_lower_first_name_idx ON patients (LOWER(first_name));
CREATE INDEX IF NOT EXISTS patients_lower_last_name_idx ON patients (LOWER(last_name));
CREATE INDEX IF NOT EXISTS patients_lower_middle_name_idx ON patients (LOWER(middle_name));
CREATE INDEX IF NOT EXISTS patients_phone_number_idx ON patients (phone_number);