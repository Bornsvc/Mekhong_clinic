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

    const results = {
      created: 0,
      updated: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const row of data as ExcelRow[]) {
      try {
        const uhid = row.UHID;
        if (!uhid) throw new Error('ຕ້ອງການ UHID');

        const uhidString = String(uhid);
        const cleanedUhid = uhidString.replace(/^MK-/, '').slice(-7);
        if (!cleanedUhid || cleanedUhid.length > 7) {
          throw new Error('ຮູບແບບ UHID ບໍ່ຖືກຕ້ອງ');
        }

        const fullName = row.FullName?.trim();
        if (!fullName) continue;
        const nameParts = fullName.split(' ');
        const firstName = nameParts.slice(0, 2).join(' ');
        const lastName = nameParts.slice(2).join(' ');

        const middleName = row.MiddleName?.trim() || '';

        const dob = parseExcelDate(row.Dob);
        if (dob && dob > new Date()) throw new Error('DOB ໃນອະນາຄົດ');

        const registered = parseExcelDate(row.Registered);

        const age = typeof row.Age === 'string' ? parseInt(row.Age.trim()) : row.Age;
        if (isNaN(age)) throw new Error('ຮູບແບບອາຍຸບໍ່ຖືກຕ້ອງ');

        const today = new Date();
        let calculatedAge = dob ? today.getFullYear() - dob.getFullYear() : 0;
        if (dob && (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate()))) {
          calculatedAge--;
        }
        if (Math.abs(calculatedAge - age) > 1) throw new Error(`ອາຍຸບໍ່ກົງກັນ (${calculatedAge} vs ${age})`);

        const balance =
        typeof row.Balance === 'string'
          ? parseFloat(row.Balance.replace(/[^0-9.-]/g, '').trim())
          : typeof row.Balance === 'number'
          ? row.Balance
          : 0;
      
        
        if (isNaN(balance)) throw new Error('ຮູບແບບຍອດເງິນບໍ່ຖືກຕ້ອງ');

        const patient = {
          id: cleanedUhid,
          first_name: firstName,
          last_name: lastName,
          middle_name: middleName,
          birth_date: dob?.toISOString() ?? new Date().toISOString(),
          registered: registered?.toISOString() ?? new Date().toISOString(),
          age: age,
          phone_number: row.Mobile || '',
          gender: row.Gender || '',
          balance: Number(balance.toFixed(2)),
          diagnosis: row.Diagnosis || '',
          address: row.Address,
          medication: row.Medication,
          purpose: row.Purpose,
          nationality: row.Nationality,
          social_security_id: row['Social Security ID']?.toString().trim(),
          social_security_expiration: parseExcelDate(row['Social Security Expiration'])?.toISOString(),
          social_security_company: row['Social Security Company']?.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // หลังจากได้ cleanedUhid แล้ว
        const existingPatient = await PatientModel.getPatientById(cleanedUhid);

        if (existingPatient) {
          // ถ้าชื่อเดิมตรง → update
          const sameName =
            `${existingPatient.first_name} ${existingPatient.last_name}` ===
            `${firstName} ${lastName}`;
          if (sameName) {
            await PatientModel.updatePatient(cleanedUhid, patient);
            results.updated++;
          } else {
            // ถ้าชื่อต่าง → สร้าง record ใหม่ โดยใช้ id ใหม่
            const newId = `${cleanedUhid}-${Date.now().toString().slice(-4)}`;
            patient.id = newId;
            await PatientModel.createPatient(patient);
            results.created++;
          }
        } else {
          // ถ้าไม่เจอ → สร้างใหม่ด้วย cleanedUhid
          patient.id = cleanedUhid;
          await PatientModel.createPatient(patient);
          results.created++;
        }

      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${data.indexOf(row) + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({ message: 'Import completed', data: results });
  } catch (error) {
    console.error('Error importing patients:', error);
    return NextResponse.json({ error: 'ລົ້ມເຫລວໃນການນໍາເຂົ້າຄົນເຈັບ' }, { status: 500 });
  }
}

function parseExcelDate(value?: string | number): Date | null {
  if (!value) return null;

  if (typeof value === 'number') {
    return new Date((value - 25569) * 86400 * 1000);
  }

  const parts = value.split(/[\/-]/);
  if (parts.length === 3) {
    const [day, month, year] = parts.map(Number);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month - 1, day);
    }
  }

  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}
