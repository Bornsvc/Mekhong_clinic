import { utils, write } from 'xlsx';
import { Patient } from '../types/patient';

export const exportPatientsToExcel = (patients: Patient[]) => {
  // Prepare data for Excel format
  const worksheet = utils.json_to_sheet(
    patients.map(patient => ({
      UHID: patient.id,
      FullName: `${patient.first_name} ${patient.last_name}`,
      Dob: new Date(patient.birth_date).toLocaleDateString(),
      Age: patient.age,
      Registered: patient.created_at,
      Gender: patient.gender,
      Mobile: patient.phone_number,
      Balance: patient.balance,
      Diagnosis: patient.diagnosis,
      Address: patient.address,
      Purpose: patient.purpose,
      Medication: patient.medication,
    }))
  );

  // Create workbook and append the worksheet
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Patients');

  // Generate buffer
  const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'buffer' });

  // Create blob and download
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `patients_data_${new Date().toISOString().split('T')[0]}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
};