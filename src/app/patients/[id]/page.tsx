'use client'
import { useEffect, useState, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import EditPatientForm from '@/app/components/editPatientForm';
import { FormContext } from "@/context/FormContext";
import Loding from "@/app/components/loding"

interface Patient {
  id: string;
  first_name: string;
  middle_name?: string; // เพิ่ม
  last_name: string;
  birth_date: string;
  registered: string;
  age: number;
  phone_number: string;
  gender: string;
  balance: number;
  diagnosis: string;
  address?: string;
  medication?: string;
  nationality?: string; // เพิ่ม
  social_security_id?: string; // เพิ่ม
  social_security_expiration?: string; // เพิ่ม
  social_security_company?: string; // เพิ่ม
  purpose?: string;
  created_at?: string;
  updated_at?: string; // เพิ่ม
}

export default function PatientDetails() {
  const { setToastMassage } = useContext(FormContext); 

  const params = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        if (params?.id) {  
          // console.log(">>>",params?.id)
          const response = await axios.get(`/api/patients/${params.id}`);
          setPatient(response.data);
          // console.log(response.data)
        } else {
          setError('Invalid patient ID');
        }
      } catch (err) {
        console.log("Error>>>>>", err);
        setError('Failed to load patient data');
      } finally {
        setLoading(false);
      }
    };
  
    fetchPatient();
  }, [params?.id]); 
  

  if (loading) {
    return (
      <Loding />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error}</p>
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          Back to Home
        </Link>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p>Patient not found</p>
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          Back to Home
        </Link>
      </div>
    );
  }
  
  const deletePatient = async () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      if(params !== null){
        const response = await axios.delete(`/api/patients/${params.id}`);
        if (response.status === 200) {
          setIsDeleteModalOpen(false);
          router.push('/'); 
          setToastMassage(true);
        } else {
          setToastMassage(false);
          throw new Error('Can not delete patient');
        }
      }
    } catch (error) {
      console.error('Delete fail:', error);
      alert('Can not delete patient, pls try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const DeleteConfirmationModal = () => {
    if (isDeleteModalOpen) {
      return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-xl w-full mx-4">
            <h3 className="text-2xl font-semibold mb-6">ລົບຄົນໄຂ້</h3>
            <p className="text-gray-600 mb-8 text-lg">
              ທ່ານແນ່ໃຈະລົບຄົນເຈັບນີ້? ການກະທຳນີ້ບໍ່ສາມາດຍ້ອນກັບໄດ້.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors text-lg"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-lg"
              >
                ລົບ
              </button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {isDeleteModalOpen && <DeleteConfirmationModal />}

      {isEditModalOpen && typeof params?.id === 'string' && (
        <EditPatientForm patientId={params.id} onClose={() => setIsEditModalOpen(false)} />
      )}

      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 group text-lg"
        >
          <svg className="w-6 h-6 mr-2 transform transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          ກັບຄືນສູ່ລາຍຊື່ຄົນເຈັບ
        </Link>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-400">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">ລາຍລະອຽດຄົນໄຂ້</h1>
                <p className="text-blue-100 mt-1 text-lg">ລະຫັດ: {patient.id}</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-4 py-2 bg-yellow-500 rounded-lg text-white hover:bg-yellow-600 transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md text-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>ເເກ້ໄຂ</span>
                </button>
                <button 
                  onClick={deletePatient}
                  className="px-4 py-2 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md text-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>ລົບ</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-2xl">
                    {patient.first_name.includes("ທ") ? "Mr" : "Mrs"}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">{`${patient.first_name} ${patient.last_name} (${patient.middle_name})` }</h2>
                  <p className="text-gray-500 text-lg">
                    Patient since: {new Date(patient.registered).toLocaleDateString('en-US')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base text-gray-500">ຍອດເງິນຄົງເຫຼືອ</p>
                <p className={`text-xl font-semibold ${patient.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ₭ {patient.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  ຂໍ້ມູນສ່ວນໂຕ
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-base text-gray-500">ວັນເດືອນປີເກີດ</p>
                      <p className="text-lg font-medium">{new Date(patient.birth_date).toLocaleDateString('en-US')}</p>
                    </div>
                    <div>
                      <p className="text-base text-gray-500">ອາຍຸ</p>
                      <p className="text-lg font-medium">{patient.age} ປີ</p>
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <p className="text-base text-gray-500">ເພດ</p>
                      <p className="text-lg font-medium">{patient.gender === 'male' ? 'ຊາຍ' : 'ຍິງ'}</p>
                    </div>
                    <div>
                      <p className="text-base text-gray-500">ສັນຊາດ</p>
                      <p className="text-lg font-medium">{patient.nationality || 'ບໍ່ມີຂໍ້ມູນ'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  ຂໍ້ມູນປະກັນສັງຄົມ
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-base text-gray-500">ເລກປະຈຳປະກັນສັງຄົມ</p>
                    <p className="text-lg font-medium">{patient.social_security_id || 'ບໍ່ມີຂໍ້ມູນ'}</p>
                  </div>
                  <div>
                    <p className="text-base text-gray-500">ວັນໝົດອາຍຸ</p>
                    <p className="text-lg font-medium">
                      {patient.social_security_expiration 
                        ? new Date(patient.social_security_expiration).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                        : 'ບໍ່ມີຂໍ້ມູນ'}
                    </p>
                  </div>
                  <div>
                    <p className="text-base text-gray-500">ບໍລິສັດ</p>
                    <p className="text-lg font-medium">{patient.social_security_company || 'ບໍ່ມີຂໍ້ມູນ'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                ຂໍ້ມູນການຕິດຕໍ່
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-base text-gray-500">ເບີໂທລະສັບ</p>
                  <p className="text-lg font-medium">{patient.phone_number}</p>
                </div>
                <div>
                  <p className="text-base text-gray-500">ທີ່ຢູ່</p>
                  <p className="text-lg font-medium">{patient.address || 'ບໍ່ມີຂໍ້ມູນ'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Medical Information
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-base text-gray-500 mb-2">ການວິນິດໄສ</p>
                  <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-lg">
                    {patient.diagnosis || 'ບໍ່ມີຂໍ້ມູນ'}
                  </div>
                </div>
                <div>
                  <p className="text-base text-gray-500 mb-2">ຢາທີ່ໃຊ້</p>
                  <div className="bg-gray-50 p-4 rounded-lg text-lg">
                    {patient.medication || 'ບໍ່ມີຂໍ້ມູນ'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}