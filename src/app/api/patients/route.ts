import { NextResponse } from 'next/server';
import { PatientModel } from '@/backend/models/Patient';

export async function GET(request: Request) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    console.log("START getPaginatedPatients");

    const result = await Promise.race([
      PatientModel.getPaginatedPatients({ page, limit, search }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database timeout')), 5000)
      )
    ]);

    console.log("END getPaginatedPatients");

    clearTimeout(timeoutId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: 'การเชื่อมต่อฐานข้อมูลล้มเหลว กรุณาลองใหม่อีกครั้ง' },
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
          { error: 'Plaese complete all input.' },
          { status: 400 }
        );
      }
  
      // ตรวจสอบรูปแบบวันที่เกิด
      const birthDateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!birthDateRegex.test(patient.birth_date)) {
        return NextResponse.json(
          { error: 'Date format is incorrect (YYYY-MM-DD)' },
          { status: 400 }
        );
      }
  
      const newPatient = await PatientModel.createPatient(patient);
      return NextResponse.json({ data: newPatient });
    } catch (error) {
      console.error('Error creating patient:', error);
      return NextResponse.json(
        { error: 'Cannot create patient' },
        { status: 500 }
      );
    }
  }

