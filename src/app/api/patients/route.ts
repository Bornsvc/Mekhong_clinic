import { NextResponse } from 'next/server';
import { PatientController } from '@/backend/controllers/PatientController';

// API สำหรับดึงข้อมูลและค้นหาผู้ป่วย
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');

  if (search) {
    const result = await PatientController.searchPatients(search);
    return NextResponse.json(result);
  }

  const result = await PatientController.getAllPatients();
  return NextResponse.json(result);
}

// API สำหรับเพิ่มผู้ป่วยใหม่
export async function POST(request: Request) {
  const data = await request.json();
  const result = await PatientController.createPatient(data);
  return NextResponse.json(result);
}

// API สำหรับลบผู้ป่วย
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ไม่ระบุ ID ผู้ป่วย' });
    }
  
    const result = await PatientController.deletePatient(id);
    return NextResponse.json(result);
}

// API สำหรับแก้ไขข้อมูลผู้ป่วย
export async function PUT(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ไม่ระบุ ID ผู้ป่วย' });
    }
  
    const data = await request.json();
    const result = await PatientController.updatePatient(id, data);
    return NextResponse.json(result);
}


