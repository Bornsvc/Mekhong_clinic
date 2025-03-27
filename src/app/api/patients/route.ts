import { NextResponse } from 'next/server';
import { PatientModel } from '@/backend/modles/Patient';

export async function GET() {
  try {
    const patients = await PatientModel.getAllPatients();
    return NextResponse.json({ data: patients });
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
    const newPatient = await PatientModel.createPatient(patient);
    return NextResponse.json({ data: newPatient });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}