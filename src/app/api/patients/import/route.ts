import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { PatientModel } from '@/backend/models/Patient';

interface ExcelRow {
  UHID: string;
  FullName: string;
  Dob: string;
  Registered: string;
  Age: string;
  Mobile: string;
  Gender: string;
  Balance: string;
  Diagnosis: string;
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  age: number;
  address: string;
  phone_number: string;
  purpose: string;
  medication: string;
  created_at: string;
  gender: string;
  balance: number;
  diagnosis: string
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an Excel file (.xlsx or .xls)' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const row of data as ExcelRow[]) {
      try {
        // Extract and validate required fields
        const uhid = row.UHID;
        if (!uhid) {
          throw new Error('UHID is required');
        }

        const fullName = row.FullName;
        if (!fullName) {
          // Skip rows without FullName
          continue;
        }

        // Split full name into first and last name
        const [firstName, ...lastNameParts] = fullName.trim().split(' ');
        const lastName = lastNameParts.join(' ');

        // Convert ISO 8601 date strings to Date objects
        const dobStr = row.Dob;
        const registeredStr = row.Registered;
        
        const dob = dobStr ? new Date(dobStr) : null;
        const registered = registeredStr ? new Date(registeredStr) : null;

        if (!dob || isNaN(dob.getTime())) {
          throw new Error('Invalid date format for Dob');
        }

        if (!registered || isNaN(registered.getTime())) {
          throw new Error('Invalid date format for Registered');
        }

        // Validate and convert age to number
        const ageStr = row.Age;
        const age = ageStr ? parseInt(ageStr.trim()) : 0;
        if (isNaN(age)) {
          throw new Error('Invalid age format');
        }

        // Validate and convert balance to number
        const balanceStr = row.Balance;
        const balance = balanceStr ? parseFloat(balanceStr.replace(/[^0-9.-]/g, '').trim()) : 0;
        if (isNaN(balance)) {
          throw new Error('Invalid balance format');
        }

        const patient = {
          id: uhid,
          first_name: firstName,
          last_name: lastName || '',
          birth_date: dob.toISOString(),
          registered: registered.toISOString(),
          age: age,
          phone_number: row.Mobile || '',
          gender: row.Gender || '',
          balance: balance,
          diagnosis: row.Diagnosis || ''
        };

        await PatientModel.createPatient(patient);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(
          `Row ${data.indexOf(row) + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return NextResponse.json({
      message: 'Import completed',
      data: results
    });
  } catch (error) {
    console.error('Error importing patients:', error);
    return NextResponse.json(
      { error: 'Failed to import patients' },
      { status: 500 }
    );
  }
}