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
  Nationality?: string;
  'Social Security ID'?: string;  // Updated field name
  'Social Security Expiration'?: string;  // Updated field name
  'Social Security Company'?: string;  // Updated field name
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
    console.log('Imported Excel Data:', data);

    const results = {
      created: 0,
      updated: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const row of data as ExcelRow[]) {
      try {
        // Log each row's social security data
        console.log('Row Social Security Data:', {
          id: row.SocialSecurityID,
          expiration: row.SocialSecurityExpiration,
          company: row.SocialSecurityCompany
        });

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
        
        if (dobStr && dobStr !== '') {
          if (typeof dobStr === 'number') {
            // Handle Excel date serial numbers
            dob = new Date((dobStr - 25569) * 86400 * 1000);
          } else if (typeof dobStr === 'string') {
            // Try parsing DD/MM/YYYY format
            const parts = dobStr.split(/[\/\-]/);
            if (parts.length === 3) {
              const [day, month, year] = parts.map(Number);
              if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                dob = new Date(year, month - 1, day);
              }
            }
            
            // If DD/MM/YYYY parsing failed, try as ISO date
            if (!dob || isNaN(dob.getTime())) {
              dob = new Date(dobStr);
            }
          }

          // Validate the parsed date
          if (!dob || isNaN(dob.getTime())) {
            throw new Error(`Invalid date format for DOB: ${dobStr}`);
          }

          // Validate DOB is not in future
          if (dob > new Date()) {
            throw new Error('Date of birth cannot be in the future');
          }
        } else {
          // Skip validation for empty dates
          dob = null;
        }

        // Validate DOB is not in future
        if (dob !== null && dob > new Date()) {
          throw new Error('Date of birth cannot be in the future');
        }

        // Calculate age from DOB and validate against provided age
        const today = new Date();
        let calculatedAge = dob !== null ? today.getFullYear() - dob.getFullYear() : 0;
        const providedAge = parseInt(row.Age);

        // Adjust age if birthday hasn't occurred this year
        const monthDiff = dob !== null ?  today.getMonth() - dob.getMonth() : 0;
        if (dob && monthDiff < 0 || dob !== null ? (monthDiff === 0 && today.getDate() < dob.getDate()) : 0) {
          calculatedAge--;
        }
        

        // Allow 1 year difference due to potential data entry timing differences
        if (Math.abs(calculatedAge - providedAge) > 1) {
          throw new Error(`Age mismatch: calculated age (${calculatedAge}) differs significantly from provided age (${providedAge})`);
        }

        const registeredStr = row.Registered;
        let registered = null;

        if (registeredStr && registeredStr !== '') {
          if (typeof registeredStr === 'number') {
            // Handle Excel date serial numbers
            registered = new Date((registeredStr - 25569) * 86400 * 1000);
          } else {
            // Try parsing various date formats
            const [day, month, year] = registeredStr.split(/[\/\-]/).map(Number);
            if (day && month && year) {
              registered = new Date(year, month - 1, day);
            } else {
              registered = new Date(registeredStr);
            }
          }

          if (!registered || isNaN(registered.getTime())) {
            throw new Error(`Invalid date format for Registration date: ${registeredStr}`);
          }
        }

        // Validate and convert age to number
        const ageStr = row.Age;
        const age = typeof ageStr === 'string' ? parseInt(ageStr.trim()) : typeof ageStr === 'number' ? ageStr : 0;
        if (isNaN(age)) {
          throw new Error('Invalid age format');
        }

        // Validate and convert balance to number with 2 decimal places
        const balanceStr = row.Balance;
        const balance = balanceStr 
          ? (typeof balanceStr === 'number' 
              ? Number(balanceStr.toFixed(2))
              : Number(parseFloat(String(balanceStr).replace(/[^0-9.-]/g, '').trim()).toFixed(2)))
          : 0.00;
        if (isNaN(balance)) {
          throw new Error('Invalid balance format');
        }

        // Handle social security fields
        const socialSecurityId = row['Social Security ID'] !== undefined ? String(row['Social Security ID']).trim() : '';
        
        // Handle social security expiration date
        let socialSecurityExpiration = null;
        if (row['Social Security Expiration']) {
          if (typeof row['Social Security Expiration'] === 'string') {
            socialSecurityExpiration = new Date(row['Social Security Expiration']);
          } else if (typeof row['Social Security Expiration'] === 'number') {
            socialSecurityExpiration = new Date((row['Social Security Expiration'] - 25569) * 86400 * 1000);
          }
        }

        const socialSecurityCompany = row['Social Security Company'] !== undefined ? String(row['Social Security Company']).trim() : '';

        const patient = {
          id: uhid,
          first_name: firstName,
          last_name: lastName || '',
          birth_date: dob ? dob.toISOString() : new Date().toISOString(),
          registered: registered ? registered.toISOString() : new Date().toISOString(),
          age: age,
          phone_number: row.Mobile || '',
          gender: row.Gender || '',
          balance: balance,
          diagnosis: row.Diagnosis || '',
          address: row.Address || '',
          purpose: row.Purpose || '',
          medication: row.Medication || '',
          nationality: row.Nationality || '',
          social_security_id: socialSecurityId,
          social_security_expiration: socialSecurityExpiration ? socialSecurityExpiration.toISOString() : null,
          social_security_company: socialSecurityCompany,
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