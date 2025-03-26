import pool from '../config/database';

// กำหนดโครงสร้างข้อมูลผู้ป่วย
export interface Patient {
  id?: string;
  first_name: string;
  last_name: string;
  birth_date: Date;
  age: number;
  address: string;
  phone_number: string;
  purpose: string;
  medication: string;
  gender: string; 
  registered: string;   
  diagnosis: string;     
  balance: number; 
}

// คลาสสำหรับจัดการข้อมูลผู้ป่วย
export class PatientModel {
  // ดึงข้อมูลผู้ป่วยทั้งหมด
  static async getAll() {
    const query = 'SELECT * FROM patients ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  // เพิ่มผู้ป่วยใหม่
  static async create(patient: Patient) {
    const query = `
      INSERT INTO patients 
      (first_name, last_name, birth_date, age, address, phone_number, purpose, medication, gender, registered, diagnosis, balance)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const values = [
      patient.first_name,
      patient.last_name,
      patient.birth_date,
      patient.age,
      patient.address,
      patient.phone_number,
      patient.purpose,
      patient.medication,
      patient.gender,
      patient.registered,
      patient.diagnosis,
      patient.balance,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // ค้นหาผู้ป่วย
  static async search(term: string) {
    const query = `
      SELECT * FROM patients 
      WHERE first_name ILIKE $1 
      OR last_name ILIKE $1 
      OR phone_number LIKE $1
    `;
    const result = await pool.query(query, [`%${term}%`]);
    return result.rows;
  }

   // ลบข้อมูลผู้ป่วย
   static async delete(id: string) {
    const query = 'DELETE FROM patients WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // แก้ไขข้อมูลผู้ป่วย
  static async update(id: string, patient: Partial<Patient>) {
    const query = `
      UPDATE patients 
      SET first_name = $1, last_name = $2, birth_date = $3, 
          age = $4, address = $5, phone_number = $6, 
          purpose = $7, medication = $8
      WHERE id = $9
      RETURNING *
    `;
    const values = [
      patient.first_name,
      patient.last_name,
      patient.birth_date,
      patient.age,
      patient.address,
      patient.phone_number,
      patient.purpose,
      patient.medication,
      id
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}
