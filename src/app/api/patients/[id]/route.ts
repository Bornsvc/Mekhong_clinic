import { NextResponse } from 'next/server';
import { PatientModel } from '@/backend/models/Patient';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const patient = await PatientModel.getPatientById(params.id);
    if (!patient) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลผู้ป่วย' },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: patient });
  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json(
      { error: 'ไม่สามารถดึงข้อมูลผู้ป่วยได้' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const patient = await request.json();
    
    // ตรวจสอบว่าผู้ป่วยมีอยู่หรือไม่
    const existingPatient = await PatientModel.getPatientById(params.id);
    if (!existingPatient) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลผู้ป่วย' },
        { status: 404 }
      );
    }

    // ตรวจสอบข้อมูลที่จำเป็น
    if (patient.birth_date) {
      const birthDateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!birthDateRegex.test(patient.birth_date)) {
        return NextResponse.json(
          { error: 'รูปแบบวันที่เกิดไม่ถูกต้อง (YYYY-MM-DD)' },
          { status: 400 }
        );
      }
    }

    const updatedPatient = await PatientModel.updatePatient(params.id, patient);
    return NextResponse.json({ data: updatedPatient });
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json(
      { error: 'ไม่สามารถอัปเดตข้อมูลผู้ป่วยได้' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // ตรวจสอบว่าผู้ป่วยมีอยู่หรือไม่
    const existingPatient = await PatientModel.getPatientById(params.id);
    if (!existingPatient) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลผู้ป่วย' },
        { status: 404 }
      );
    }

    await PatientModel.deletePatient(params.id);
    return NextResponse.json({ message: 'ลบข้อมูลผู้ป่วยสำเร็จ' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json(
      { error: 'ไม่สามารถลบข้อมูลผู้ป่วยได้' },
      { status: 500 }
    );
  }
}