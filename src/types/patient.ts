export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  registered: string;
  age: number;
  phone_number: string;
  gender: string;
  balance: number;
  diagnosis: string;
  address?: string;
  medication?: string;
  purpose?: string;
  created_at?: string;
}