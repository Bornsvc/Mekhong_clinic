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

    console.log("----------------------------------------");
    console.log("START getPaginatedPatients");

    const result = await PatientModel.getPaginatedPatients({ page, limit, search });


    console.log("END getPaginatedPatients");
    console.log("----------------------------------------");
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
      
      // Generate 6-digit UHID
      const lastPatient = await PatientModel.getLastPatient();
      const lastId = lastPatient ? parseInt(lastPatient.id) : 0;
      const newId = (lastId + 1).toString().padStart(6, '0');
      
      // เพิ่มการตรวจสอบข้อมูลที่จำเป็น
      if (!patient.first_name || !patient.last_name || !patient.birth_date) {
        return NextResponse.json(
          { error: 'Please complete all input.' },
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
  
      const newPatient = await PatientModel.createPatient({
        ...patient,
        id: newId
      });
      
      return NextResponse.json({ data: newPatient });
    } catch (error) {
      console.error('Error creating patient:', error);
      return NextResponse.json(
        { error: 'Cannot create patient' },
        { status: 500 }
      );
    }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    const deletedPatient = await PatientModel.deletePatient(id);
    
    if (!deletedPatient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Patient deleted successfully',
      data: deletedPatient
    });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json(
      { error: 'Failed to delete patient' },
      { status: 500 }
    );
  }
}

