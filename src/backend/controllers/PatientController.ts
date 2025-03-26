import { PatientModel, Patient } from '../models/Patient';

export class PatientController {
  // ฟังก์ชันดึงข้อมูลผู้ป่วยทั้งหมด
  static async getAllPatients() {
    try {
      const patients = await PatientModel.getAll();
      return { success: true, data: patients };
    } catch (error) {
        console.log("Error from PatientController.getAllPatients: ", error);
      return { success: false, error: 'ไม่สามารถดึงข้อมูลผู้ป่วยได้' };
    }
  }
  // ฟังก์ชันเพิ่มผู้ป่วยใหม่
  static async createPatient(data: Patient) {
    try {
      const patient = await PatientModel.create(data);
      return { success: true, data: patient };
    } catch (error) {
        console.log("Error from PatientController.createPatient: ", error);
      return { success: false, error: 'ไม่สามารถเพิ่มข้อมูลผู้ป่วยได้' };
    }
  }

  // ฟังก์ชันค้นหาผู้ป่วย
  static async searchPatients(term: string) {
    try {
      const patients = await PatientModel.search(term);
      return { success: true, data: patients };
    } catch (error) {
        console.log("Error from PatientController.searchPatients: ", error);
      return { success: false, error: 'ไม่สามารถค้นหาข้อมูลผู้ป่วยได้' };
    }
  }

   // ลบผู้ป่วย
   static async deletePatient(id: string) {
    try {
      const patient = await PatientModel.delete(id);
      if (!patient) {
        return { success: false, error: 'ไม่พบข้อมูลผู้ป่วย' };
      }
      return { success: true, data: patient };
    } catch (error) {
        console.log("error from PatientController.deletePatient: ", error);
      return { success: false, error: 'ไม่สามารถลบข้อมูลผู้ป่วยได้' };
    }
  }

  // แก้ไขข้อมูลผู้ป่วย
  static async updatePatient(id: string, data: Partial<Patient>) {
    try {
      const patient = await PatientModel.update(id, data);
      if (!patient) {
        return { success: false, error: 'ไม่พบข้อมูลผู้ป่วย' };
      }
      return { success: true, data: patient };
    } catch (error) {
        console.log("Error from PatientController.updatePatient: ", error);
      return { success: false, error: 'ไม่สามารถแก้ไขข้อมูลผู้ป่วยได้' };
    }
  }
}