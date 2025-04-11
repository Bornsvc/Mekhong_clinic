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
    let countQuery = 'SELECT COUNT(*) FROM patients';  // Remove LIMIT 1 here
    let dataQuery = 'SELECT * FROM patients';
    const queryParams: (string | number)[] = [];

    if (search) {
      const searchCondition = `
        LOWER(first_name) LIKE LOWER($1)
        OR LOWER(last_name) LIKE LOWER($1)
        OR LOWER(middle_name) LIKE LOWER($1)
        OR phone_number ILIKE $1
      `;
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
  
  async updatePatient(id: string, patient: Patient) {
    try {
      // ตรวจสอบการเชื่อมต่อกับฐานข้อมูล
      await pool.query('SELECT 1');

      // ตรวจสอบข้อมูลที่จำเป็น
      if (!patient.first_name?.trim() || !patient.last_name?.trim()) {
        throw new Error('กรุณากรอกชื่อและนามสกุลให้ครบถ้วน');
      }

      // ตรวจสอบรูปแบบวันที่
      if (patient.birth_date) {
        const birthDate = new Date(patient.birth_date);
        if (isNaN(birthDate.getTime())) {
          throw new Error('รูปแบบวันเกิดไม่ถูกต้อง');
        }
        patient.birth_date = birthDate.toISOString().split('T')[0];
      }

      const query = `
        UPDATE patients
        SET
          first_name = $1,
          middle_name = $2,
          last_name = $3,
          birth_date = $4,
          age = $5,
          phone_number = $6,
          gender = $7,
          medication = $8,
          balance = $9,
          diagnosis = $10,
          address = $11,
          nationality = $12,
          social_security_id = $13,
          social_security_expiration = $14,
          social_security_company = $15,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $16
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
        patient.social_security_company,
        id
      ];

      const { rows } = await pool.query(query, values);
      if (!rows || rows.length === 0) {
        throw new Error('ไม่พบข้อมูลผู้ป่วยที่ต้องการอัพเดท');
      }

      console.log('อัพเดทข้อมูลผู้ป่วยสำเร็จ:', rows[0]);
      return rows[0];
    } catch (error: unknown) {
      console.error('Error in updatePatient:', error);
      if (error instanceof Error) {
        // ตรวจสอบข้อผิดพลาดเกี่ยวกับ plpgsql extension
        if (error.message.includes('plpgsql') || error.message.includes('$libdir/plpgsql')) {
          throw new Error('ระบบฐานข้อมูลมีปัญหาเกี่ยวกับ plpgsql extension กรุณาติดต่อผู้ดูแลระบบเพื่อตรวจสอบการติดตั้ง');
        }
        // ตรวจสอบข้อผิดพลาดเกี่ยวกับการเชื่อมต่อฐานข้อมูล
        if (error.message.includes('connection') || error.message.includes('timeout')) {
          throw new Error('ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้ กรุณาลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบ');
        }
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดที่ไม่คาดคิดในการอัปเดตข้อมูลผู้ป่วย');
    }
  },
  async deletePatient(id: string) {
    const query = 'DELETE FROM patients WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}
