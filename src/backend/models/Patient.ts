import pool from '../config/database';
import { Patient } from '@/types/patient';


interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const PatientModel = {
  async getAllPatients() {
    const query = 'SELECT * FROM patients ORDER BY created_at DESC';
    const { rows } = await pool.query(query);
    return rows;
  },

  async getPaginatedPatients(params: QueryParams) {
    const { page = 1, limit = 10, search } = params;
    const offset = (page - 1) * limit;
    let countQuery = 'SELECT COUNT(*) FROM patients';
    let dataQuery = 'SELECT * FROM patients';
    const queryParams: (string | number)[] = [];

    if (search) {
      const searchCondition = "first_name ILIKE $1 OR last_name ILIKE $1 OR phone_number ILIKE $1 OR CONCAT(first_name, ' ', last_name) ILIKE $1";
      countQuery += ` WHERE ${searchCondition}`;
      dataQuery += ` WHERE ${searchCondition}`;
      queryParams.push(`%${search}%`);
    }

    dataQuery += ' ORDER BY created_at DESC';

    if (limit > 0) {
      dataQuery += ' LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
      queryParams.push(limit, offset);
    }

    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, search ? [queryParams[0]] : []),
      pool.query(dataQuery, queryParams)
    ]);

    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: dataResult.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit
      }
    };
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
          first_name, middle_name, last_name, birth_date, age, registered,
          phone_number, gender, medication, balance, diagnosis, address,
          nationality, social_security_id, social_security_expiration, social_security_company
        ) VALUES (
          $1, $2, $3, $4, $5, CURRENT_TIMESTAMP,
          $6, $7, $8, $9, $10, $11,
          $12, $13, $14, $15
        )
        RETURNING *
      `;
  
      const values = [
        patient.first_name,
        patient.middle_name,
        patient.last_name,
        patient.birth_date,
        patient.age,
        patient.phone_number,
        patient.gender,
        patient.medication,
        patient.balance,
        patient.diagnosis,
        patient.address,
        patient.nationality,
        patient.social_security_id,
        patient.social_security_expiration,
        patient.social_security_company
      ];
  
      const { rows } = await pool.query(query, values);
      return rows[0];
  
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create patient: ${errorMessage}`);
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