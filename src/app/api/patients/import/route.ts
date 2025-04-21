import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { PatientModel } from '@/backend/models/Patient';

interface ExcelRow {
  UHID: string;
  FullName: string;
  MiddleName: string;
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
        { error: 'ບໍ່ມີໄຟລອັບໂຫຼດ' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'ປະເພດໄຟລບໍ່ຖືກຕ້ອງ. ກະລຸນາອັບໂຫລດໄຟລ໌ Excel (.xlsx ຫຼື .xls)' },
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
        // // Log each row's social security data
        // console.log('Row Social Security Data:', {
        //   id: row.SocialSecurityID,
        //   expiration: row.SocialSecurityExpiration,
        //   company: row.SocialSecurityCompany
        // });

        // Extract and validate required fields
        const uhid = row.UHID;
        if (!uhid) {
          throw new Error('ຕ້ອງການ UHID');
        }

        // Convert to string and clean UHID
        const uhidString = String(uhid);
        const cleanedUhid = uhidString.replace(/^MK-/, '').slice(-7);
        if (!cleanedUhid || cleanedUhid.length > 7) {
          throw new Error('ຮູບແບບ UHID ບໍ່ຖືກຕ້ອງ - ຕ້ອງມີ 7 ຕົວເລກ ຫຼືໜ້ອຍກວ່າ');
        }

        const fullName = row.FullName;
        if (!fullName) {
          // Skip rows without FullName
          continue;
        }

        // Split the full name into parts
        const nameParts = fullName.trim().split(' ');

        // Get the first name by joining the first two parts
        const firstName = nameParts.slice(0, 2).join(' ');

        // Get the last name by taking the remaining part
        const lastName = nameParts.slice(2).join(' ');

        const middleName = 'MiddleName' in row ? row.MiddleName || '' : '';
        const middle_name = middleName ? middleName.trim() : '';

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
                dob = new Date(year, month - 1, day );
              }
            }
            
            // If DD/MM/YYYY parsing failed, try as ISO date
            if (!dob || isNaN(dob.getTime())) {
              dob = new Date(dobStr);
            }
          }

          // Validate the parsed date
          if (!dob || isNaN(dob.getTime())) {
            throw new Error(`ຮູບແບບວັນທີບໍ່ຖືກຕ້ອງສໍາລັບ DOB: ${dobStr}`);
          }

          // Validate DOB is not in future
          if (dob > new Date()) {
            throw new Error('ວັນເດືອນປີເກີດບໍ່ສາມາດເປັນໃນອະນາຄົດ');
          }
        } else {
          // Skip validation for empty dates
          dob = null;
        }

        // Validate DOB is not in future
        if (dob !== null && dob > new Date()) {
          throw new Error('ວັນເດືອນປີເກີດບໍ່ສາມາດເປັນໃນອະນາຄົດ');
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
          throw new Error(`ອາຍຸບໍ່ກົງກັນ: ອາຍຸທີ່ຄິດໄລ່ (${calculatedAge}) ແຕກຕ່າງກັນຢ່າງຫຼວງຫຼາຍຈາກອາຍຸທີ່ສະຫນອງໃຫ້ (${providedAge})`);
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
            throw new Error(`ຮູບແບບວັນທີບໍ່ຖືກຕ້ອງສໍາລັບວັນທີລົງທະບຽນ: ${registeredStr}`);
          }
        }

        // Validate and convert age to number
        const ageStr = row.Age;
        const age = typeof ageStr === 'string' ? parseInt(ageStr.trim()) : typeof ageStr === 'number' ? ageStr : 0;
        if (isNaN(age)) {
          throw new Error('ຮູບແບບອາຍຸບໍ່ຖືກຕ້ອງ');
        }

        // Validate and convert balance to number with 2 decimal places
        const balanceStr = row.Balance;
        const balance = typeof balanceStr === 'string' 
          ? parseFloat(balanceStr.replace(/[^0-9.-]/g, '').trim()) 
          : typeof balanceStr === 'number' 
            ? balanceStr 
            : 0;

        if (isNaN(balance)) {
          throw new Error('ຮູບແບບຍອດເງິນບໍ່ຖືກຕ້ອງ');
        }

        // Use toFixed() on the numeric value
        const formattedBalance = Number(balance.toFixed(2));

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
          id: cleanedUhid,  // Use the cleaned UHID
          first_name: firstName,
          last_name: lastName || '',
          middle_name: middle_name || '',
          birth_date: dob ? dob.toISOString() : new Date().toISOString(),
          registered: registered ? registered.toISOString() : new Date().toISOString(),
          age: Number(age),
          phone_number: String(row.Mobile || ''),
          gender: String(row.Gender || ''),
          balance: formattedBalance,
          diagnosis: String(row.Diagnosis || ''),
          // Optional fields with proper type handling
          address: row.Address || undefined,
          medication: row.Medication || undefined,
          purpose: row.Purpose || undefined,
          nationality: row.Nationality || undefined,
          social_security_id: socialSecurityId || undefined,
          social_security_expiration: socialSecurityExpiration ? socialSecurityExpiration.toISOString() : undefined,
          social_security_company: socialSecurityCompany || undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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
      { error: 'ລົ້ມເຫລວໃນການນໍາເຂົ້າຄົນເຈັບ' },
      { status: 500 }
    );
  }
}