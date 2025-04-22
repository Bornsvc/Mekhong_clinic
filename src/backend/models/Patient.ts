import {pool} from '../config/database';
import { Patient } from '@/types/patient';

interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

function cleanValue(value: Patient[keyof Patient]) {
  return value === '' ? null : value;
}

export const PatientModel = {
  async getAllPatients() {
    console.log('📦 getAllPatients: กำลังดึงข้อมูลผู้ป่วยทั้งหมด');
    const query = 'SELECT * FROM patients ORDER BY created_at DESC';
    const { rows } = await pool.query(query);
    return rows;
  },

  async getPaginatedPatients(params: QueryParams) {
    const { page = 1, limit = 10, search } = params;
    const offset = (page - 1) * limit;
    console.log('🔍 เรียกดูข้อมูลแบบมีหน้า:', { page, limit, search });
  
    // Normalize the search term by removing spaces
    const normalizedSearch = search ? search.replace(/\s+/g, '') : '';
  
    let countQuery = 'SELECT COUNT(*) FROM patients';
    let dataQuery = 'SELECT * FROM patients';
    const queryParams: (string | number)[] = [];
  
    if (normalizedSearch) {
      const searchCondition = `
        LOWER(REPLACE(first_name, ' ', '')) LIKE LOWER($1)
        OR LOWER(REPLACE(last_name, ' ', '')) LIKE LOWER($1)
        OR LOWER(REPLACE(middle_name, ' ', '')) LIKE LOWER($1)
        OR REPLACE(phone_number, ' ', '') ILIKE $1
        OR LOWER(REPLACE(first_name, ' ', '') || REPLACE(last_name, ' ', '')) LIKE LOWER($1)
        OR LOWER(REPLACE(first_name, ' ', '') || ' ' || REPLACE(middle_name, ' ', '') || ' ' || REPLACE(last_name, ' ', '')) LIKE LOWER($1)
      `;
      countQuery += ` WHERE ${searchCondition}`;
      dataQuery += ` WHERE ${searchCondition}`;
      queryParams.push(`%${normalizedSearch}%`);
    }
  
    dataQuery += ' ORDER BY created_at DESC';
  
    if (limit > 0) {
      dataQuery += ' LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
      queryParams.push(limit, offset);
    }
  
    console.log('📝 SQL - Count Query:', countQuery);
    console.log('📝 SQL - Data Query:', dataQuery);
    console.log('📦 Params ที่ส่ง:', queryParams);
  
    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, search ? [queryParams[0]] : []),
      pool.query(dataQuery, queryParams)
    ]);
  
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);
  
    if (dataResult.rows.length === 0) {
      return {
        message: 'ไม่พบข้อมูลผู้ป่วย',
        data: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limit
        }
      };
    }
  
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
    console.log('🔍 getPatientById:', id);
    const query = 'SELECT * FROM patients WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },
  async getPatientByIdOrNewId(id: string) {
    console.log('🔍 getPatientByIdOrNewId:', id);
    const query = `
      SELECT * FROM patients 
      WHERE id = $1 OR new_id = $1
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  async createPatient(patient: Patient) {
    try {
      console.log('🆕 createPatient:', patient);
      const query = `
        INSERT INTO patients (
          id, first_name, middle_name, last_name, birth_date, age, registered,
          phone_number, gender, medication, balance, diagnosis, address,
          nationality, social_security_id, social_security_expiration, social_security_company
        ) VALUES (
          $1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP,
          $7, $8, $9, $10, $11, $12,
          $13, $14, $15, $16
        )
        RETURNING *
      `;

      const values = [
        patient.id,
        cleanValue(patient.first_name),
        cleanValue(patient.middle_name),
        cleanValue(patient.last_name),
        cleanValue(patient.birth_date),
        cleanValue(patient.age),
        cleanValue(patient.phone_number),
        cleanValue(patient.gender),
        cleanValue(patient.medication),
        cleanValue(patient.balance),
        cleanValue(patient.diagnosis),
        cleanValue(patient.address),
        cleanValue(patient.nationality),
        cleanValue(patient.social_security_id),
        cleanValue(patient.social_security_expiration),
        cleanValue(patient.social_security_company)
      ];

      console.log('📦 createPatient values:', values);
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to create patient:', errorMessage);
      throw new Error(`Failed to create patient: ${errorMessage}`);
    }
  },

  async updatePatient(id: string, patient: Patient) {
    try {
      console.log('🛠️ updatePatient ID:', id);
  
      // Step 1: Check if the patient exists by ID
      const existingPatient = await this.getPatientById(id);
      if (!existingPatient) {
        throw new Error('ไม่พบข้อมูลผู้ป่วยที่ต้องการอัพเดท');
      }
  
      // Step 2: Validate required fields
      if (!patient.first_name?.trim() || !patient.last_name?.trim()) {
        throw new Error('กรุณากรอกชื่อและนามสกุลให้ครบถ้วน');
      }
  
      if (patient.birth_date) {
        const birthDate = new Date(patient.birth_date);
        if (isNaN(birthDate.getTime())) {
          throw new Error('รูปแบบวันเกิดไม่ถูกต้อง');
        }
        patient.birth_date = birthDate.toISOString().split('T')[0];
      }
  
      // Step 3: ตรวจสอบ new_id ซ้ำ (ถ้ามีการแก้ไข)
      if (patient.new_id && patient.new_id !== id) {
        const checkQuery = `SELECT id FROM patients WHERE (new_id = $1 OR id = $1) AND id != $2`;
        const checkResult = await pool.query(checkQuery, [patient.new_id, id]);
  
        if (checkResult.rowCount !== null && checkResult.rowCount > 0) {
          throw new Error('ລະຫັດໃໝ່ມີຢູ່ແລ້ວ');
        }
      }
  
      // Step 4: Update patient details in the database
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
          new_id = $16,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $17
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
        patient.new_id || null, // อาจเป็น null ได้
        id,
      ];
  
      console.log('📦 updatePatient values:', values);
  
      const { rows } = await pool.query(query, values);
      if (!rows.length) {
        throw new Error('ไม่พบข้อมูลผู้ป่วยที่ต้องการอัพเดท');
      }
  
      console.log('✅ อัพเดทสำเร็จ:', rows[0]);
      return rows[0];
    } catch (error: unknown) {
      console.error('❌ Error in updatePatient:', error);
      if (error instanceof Error) {
        if (error.message.includes('plpgsql') || error.message.includes('$libdir/plpgsql')) {
          throw new Error('ระบบฐานข้อมูลมีปัญหาเกี่ยวกับ plpgsql extension กรุณาติดต่อผู้ดูแลระบบ');
        }
        if (error.message.includes('connection') || error.message.includes('timeout')) {
          throw new Error('ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้ กรุณาลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบ');
        }
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดที่ไม่คาดคิดในการอัปเดตข้อมูลผู้ป่วย');
    }
  },
  

  // async updatePatientId(oldId: string, newId: string) {
  //   const client = await pool.connect();
  //   try {
  //     console.log(`🔁 เริ่มอัปเดต ID จาก ${oldId} เป็น ${newId}`);
  
  //     // 1. ตรวจสอบว่ามีผู้ป่วยที่ใช้ oldId อยู่หรือไม่
  //     const existingPatient = await this.getPatientById(oldId);
  //     if (!existingPatient) {
  //       throw new Error(`ไม่พบผู้ป่วยที่ใช้ ID เดิม (${oldId})`);
  //     }
  
  //     // 2. ตรวจสอบว่า newId ซ้ำกับของคนอื่นหรือเปล่า
  //     const isDuplicate = await this.getPatientById(newId);
  //     if (isDuplicate) {
  //       throw new Error(`ไม่สามารถเปลี่ยน ID ได้ เพราะ ID ใหม่ (${newId}) ถูกใช้แล้ว`);
  //     }
  
  //     // 3. เริ่ม transaction เพื่อให้แน่ใจว่าการเปลี่ยน ID ปลอดภัย
  //     await pool.query('BEGIN');
  
  //     // 4. อัปเดต ID
  //     const updateQuery = `
  //       UPDATE patients
  //       SET id = $1, updated_at = CURRENT_TIMESTAMP
  //       WHERE id = $2
  //       RETURNING *
  //     `;
  //     const { rows } = await pool.query(updateQuery, [newId, oldId]);
  
  //     // 5. Commit การเปลี่ยนแปลง
  //     await pool.query('COMMIT');
  //     console.log('✅ เปลี่ยน ID สำเร็จ:', rows[0]);
  
  //     return rows[0];
  
  //   } catch (error: unknown) {
  //     // Rollback ถ้ามีข้อผิดพลาด
  //     await pool.query('ROLLBACK');
    
  //     if (error instanceof Error) {
  //       console.error('❌ เปลี่ยน ID ไม่สำเร็จ:', error.message);
  //       throw new Error('เกิดข้อผิดพลาดในการเปลี่ยน ID: ' + error.message);
  //     }
    
  //     // กรณี error ไม่ใช่ Error object
  //     console.error('❌ เปลี่ยน ID ไม่สำเร็จ:', error);
  //     throw new Error('เกิดข้อผิดพลาดที่ไม่รู้จักในการเปลี่ยน ID');
  //   } finally{
  //     client.release();
  //   }
    
  // },

  async changePatientIdSafe(oldId: string, newId: string) {
    const client = await pool.connect();
  
    try {
      await client.query('BEGIN');
  
      const { rowCount: oldCount } = await client.query('SELECT 1 FROM patients WHERE id = $1', [oldId]);
      if (oldCount === 0) throw new Error(`ไม่พบ ID เก่า ${oldId} ในระบบ`);
  
      const { rowCount: newCount } = await client.query('SELECT 1 FROM patients WHERE id = $1', [newId]);
      if (newCount !== null &&newCount > 0 ) throw new Error(`ID ใหม่ ${newId} มีอยู่ในระบบแล้ว`);
  
      const result = await client.query('UPDATE patients SET id = $1 WHERE id = $2', [newId, oldId]);
      console.log(`📦 เปลี่ยน ID สำเร็จ: ${oldId} -> ${newId}, affectedRows: ${result.rowCount}`);
  
      await client.query('COMMIT');
      return true;
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      if (error instanceof Error) {
        console.error('❌ เปลี่ยน ID ไม่สำเร็จ:', error.message);
        throw new Error('เกิดข้อผิดพลาดในการเปลี่ยน ID: ' + error.message);
      }
      throw new Error('เกิดข้อผิดพลาดที่ไม่รู้จักในการเปลี่ยน ID');
    } finally {
      client.release();
    }
  },
  
  async getLastPatient() {
    try {
      const query = `
        SELECT id 
        FROM patients 
        ORDER BY 
          CASE 
            WHEN id ~ '^[0-9]+$' THEN CAST(id AS INTEGER)
            ELSE 0
          END DESC,
          id DESC 
        LIMIT 1
      `;
      const { rows } = await pool.query(query);
      return rows[0];
    } catch (error) {
      console.error('Error getting last patient:', error);
      throw error;
    }
  },

  async deletePatient(id: string) {
    try {
      console.log('🗑️ Deleting patient with ID:', id);
      
      // Check if patient exists
      const checkQuery = 'SELECT id FROM patients WHERE id = $1';
      const { rows: checkRows } = await pool.query(checkQuery, [id]);
      
      if (checkRows.length === 0) {
        throw new Error(`Patient with ID ${id} not found`);
      }
  
      // Delete the patient
      const query = 'DELETE FROM patients WHERE id = $1 RETURNING *';
      const { rows } = await pool.query(query, [id]);
      
      console.log('✅ Patient deleted successfully');
      return rows[0];
    } catch (error) {
      console.error('❌ Error deleting patient:', error);
      throw error;
    }
  },
};
