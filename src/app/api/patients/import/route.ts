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
  Address: string;
  Purpose: string;
  Medication: string;
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
      created: 0,
      updated: 0,
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
        // Parse DOB with more robust date handling
        const dobStr = row.Dob;
        let dob = null;
        
        if (dobStr) {
          // Try parsing various date formats
          // First try DD/MM/YYYY format as it's the expected format
          const [day, month, year] = dobStr.split(/[\/\-]/).map(Number);
          if (day && month && year) {
            dob = new Date(year, month - 1, day);
          } else if (typeof dobStr === 'number') {
            // Handle Excel date serial numbers
            dob = new Date((dobStr - 25569) * 86400 * 1000);
          } else {
            // Try parsing string date as fallback
            dob = new Date(dobStr);
          }
        }

        if (!dob || isNaN(dob.getTime())) {
          throw new Error(`Invalid date format for DOB: ${dobStr}`);
        }

        // Validate DOB is not in future
        if (dob > new Date()) {
          throw new Error('Date of birth cannot be in the future');
        }

        // Calculate age from DOB and validate against provided age
        const today = new Date();
        let calculatedAge = today.getFullYear() - dob.getFullYear();
        const providedAge = parseInt(row.Age);

        // Adjust age if birthday hasn't occurred this year
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          calculatedAge--;
        }

        // Allow 1 year difference due to potential data entry timing differences
        if (Math.abs(calculatedAge - providedAge) > 1) {
          throw new Error(`Age mismatch: calculated age (${calculatedAge}) differs significantly from provided age (${providedAge})`);
        }

        const registeredStr = row.Registered;
        const registered = registeredStr ? new Date(registeredStr) : null;

        if (!registered || isNaN(registered.getTime())) {
          throw new Error('Invalid date format for Registered');
        }

        // Validate and convert age to number
        const ageStr = row.Age;
        const age = typeof ageStr === 'string' ? parseInt(ageStr.trim()) : typeof ageStr === 'number' ? ageStr : 0;
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
          diagnosis: row.Diagnosis || '',
          address: row.Address || '',
          purpose: row.Purpose || '',
          medication: row.Medication || ''
        };

        // Check if patient already exists
        const existingPatient = await PatientModel.getPatientById(uhid);
        
        if (existingPatient) {
          // Update existing patient
          await PatientModel.updatePatient(uhid, patient);
          results.updated++;
        } else {
          // Create new patient
          await PatientModel.createPatient(patient);
          results.created++;
        }
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