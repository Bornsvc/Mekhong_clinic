export interface Patient {
  id: string;
  first_name: string;
  middle_name?: string; // เพิ่ม
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
  nationality?: string; // เพิ่ม
  social_security_id?: string; // เพิ่ม
  social_security_expiration?: string; // เพิ่ม
  social_security_company?: string; // เพิ่ม
  purpose?: string;
  created_at?: string;
  updated_at?: string; // เพิ่ม
  new_id: string
}
