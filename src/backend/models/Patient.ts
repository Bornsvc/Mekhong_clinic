import pool from '../config/database';
import { DatabaseError } from 'pg';

export interface Patient {
  id?: number;
  first_name: string;
  last_name: string;
  birth_date: Date;
  age: number;
  registered: Date;
  phone_number: string;
  gender: string;
  medication: string;
  balance: number;
  diagnosis: string;
  address: string;
}

export const PatientModel = {
  async getAllPatients() {
    const query = 'SELECT * FROM patients ORDER BY created_at DESC';
    const { rows } = await pool.query(query);
    return rows;
  },

  async getPatientById(id: string) {
    const query = 'SELECT * FROM patients WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  async createPatient(patient: Patient) {
    try {
      const query = `
        INSERT INTO patients (
          first_name, last_name, birth_date, age, registered,
          phone_number, gender, medication, balance, diagnosis, address
        ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP,
          $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      
      console.log('กำลังพยายามสร้างข้อมูลผู้ป่วย:', patient);
      
      const values = [
        patient.first_name,
        patient.last_name,
        patient.birth_date,
        patient.age,
        patient.phone_number,
        patient.gender,
        patient.medication,
        patient.balance,
        patient.diagnosis,
        patient.address
      ];
      
      const { rows } = await pool.query(query, values);
      console.log('สร้างข้อมูลผู้ป่วยสำเร็จ:', rows[0]);
      return rows[0];
    } catch (error) {
      if (error instanceof DatabaseError) {
        console.error('เกิดข้อผิดพลาดในการสร้างข้อมูลผู้ป่วย:', {
          รหัสข้อผิดพลาด: error.code,
          ข้อความ: error.message,
          รายละเอียด: error.detail
        });
      }
      const errorMessage = error instanceof Error ? error.message : 'ข้อผิดพลาดที่ไม่ทราบสาเหตุ';
      throw new Error(`ไม่สามารถสร้างข้อมูลผู้ป่วยได้: ${errorMessage}`);
    }
},

  async updatePatient(id: string, patient: Partial<Patient>) {
    const fields = Object.keys(patient).map((key, index) => `${key} = $${index + 1}`);
    const values = Object.values(patient);
    
    const query = `
      UPDATE patients 
      SET ${fields.join(', ')}
      WHERE id = $${values.length + 1}
      RETURNING *
    `;
    
    const { rows } = await pool.query(query, [...values, id]);
    return rows[0];
  },

  async deletePatient(id: string) {
    const query = 'DELETE FROM patients WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
};