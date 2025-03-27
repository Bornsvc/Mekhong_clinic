import { NextResponse } from 'next/server';
import { PatientModel } from '@/backend/modles/Patient';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const patient = await request.json();
    const updatedPatient = await PatientModel.updatePatient(Number(params.id), patient);
    return NextResponse.json({ data: updatedPatient });
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json(
      { error: 'Failed to update patient' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await PatientModel.deletePatient(Number(params.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json(
      { error: 'Failed to delete patient' },
      { status: 500 }
    );
  }
}