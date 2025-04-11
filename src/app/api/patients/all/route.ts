import { NextResponse } from 'next/server';
import { PatientModel } from '@/backend/models/Patient';

export async function GET() {
  try {
    console.log('📦 getAllPatients: กำลังดึงข้อมูลผู้ป่วยทั้งหมด');
    const patients = await PatientModel.getAllPatients();
    return NextResponse.json(patients);
  } catch (error) {
    console.error('Error fetching all patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch all patients' },
      { status: 500 }
    );
  }
}