import pool from '../config/database';

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

  async createPatient(patient: Patient) {
    const query = `
      INSERT INTO patients (
        first_name, last_name, birth_date, age, registered,
        phone_number, gender, medication, balance, diagnosis, address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const values = [
      patient.first_name,
      patient.last_name,
      patient.birth_date,
      patient.age,
      patient.registered,
      patient.phone_number,
      patient.gender,
      patient.medication,
      patient.balance,
      patient.diagnosis,
      patient.address
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async updatePatient(id: number, patient: Partial<Patient>) {
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

  async deletePatient(id: number) {
    const query = 'DELETE FROM patients WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
};