import { NextResponse } from 'next/server';
import { PatientModel } from '@/backend/models/Patient';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const patient = await PatientModel.getPatientById(params.id);
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: patient });
  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const patient = await request.json();
    const updatedPatient = await PatientModel.updatePatient(params.id, patient);
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
    const deletedPatient = await PatientModel.deletePatient(params.id);
    if (!deletedPatient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: deletedPatient });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json(
      { error: 'Failed to delete patient' },
      { status: 500 }
    );
  }
}