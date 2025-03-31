import { NextResponse } from 'next/server';
import { PatientModel } from '@/backend/models/Patient';

export async function GET(request: Request) {
  try {
    const id = new URL(request.url).pathname.split('/').pop();
    if (!id) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    const patient = await PatientModel.getPatientById(id);

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const id = new URL(request.url).pathname.split('/').pop();
    console.log('Patient ID:', id); // ตรวจสอบว่า id ถูกต้องหรือไม่

    if (!id) {
      return NextResponse.json({ error: 'ต้องการรหัสผู้ป่วย' }, { status: 400 });
    }

    const patient = await request.json();
    console.log('Received Patient Data:', patient); // ตรวจสอบข้อมูลที่ได้รับ

    // ตรวจสอบว่าผู้ป่วยมีอยู่หรือไม่
    const existingPatient = await PatientModel.getPatientById(id);
    if (!existingPatient) {
      return NextResponse.json({ error: 'ไม่พบผู้ป่วยในระบบ' }, { status: 404 });
    }

    // ตรวจสอบข้อมูลที่จำเป็น
    if (patient.birth_date) {
      const birthDateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!birthDateRegex.test(patient.birth_date)) {
        return NextResponse.json(
          { error: 'รูปแบบวันเกิดไม่ถูกต้อง (YYYY-MM-DD)' },
          { status: 400 }
        );
      }
    }

    const updatedPatient = await PatientModel.updatePatient(id, patient);
    console.log('Updated Patient:', updatedPatient); // ตรวจสอบข้อมูลที่ได้รับจากการอัปเดต
    return NextResponse.json({ data: updatedPatient });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ป่วย:', error);
    return NextResponse.json(
      { error: 'ไม่สามารถอัปเดตข้อมูลผู้ป่วยได้' },
      { status: 500 }
    );
  }
}



export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).pathname.split('/').pop();
    if (!id) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    // ตรวจสอบว่าผู้ป่วยมีอยู่หรือไม่
    const existingPatient = await PatientModel.getPatientById(id);
    if (!existingPatient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    await PatientModel.deletePatient(id);
    return NextResponse.json({ message: 'Successfully deleted patient.' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
