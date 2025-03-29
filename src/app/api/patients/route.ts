import { NextResponse } from 'next/server';
import { PatientModel } from '@/backend/models/Patient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const result = await PatientModel.getPaginatedPatients(page, limit);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
    try {
      const patient = await request.json();
      
      // เพิ่มการตรวจสอบข้อมูลที่จำเป็น
      if (!patient.first_name || !patient.last_name || !patient.birth_date) {
        return NextResponse.json(
          { error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' },
          { status: 400 }
        );
      }
  
      // ตรวจสอบรูปแบบวันที่เกิด
      const birthDateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!birthDateRegex.test(patient.birth_date)) {
        return NextResponse.json(
          { error: 'รูปแบบวันที่เกิดไม่ถูกต้อง (YYYY-MM-DD)' },
          { status: 400 }
        );
      }
  
      const newPatient = await PatientModel.createPatient(patient);
      return NextResponse.json({ data: newPatient });
    } catch (error) {
      console.error('Error creating patient:', error);
      return NextResponse.json(
        { error: 'ไม่สามารถสร้างข้อมูลผู้ป่วยได้' },
        { status: 500 }
      );
    }
  }