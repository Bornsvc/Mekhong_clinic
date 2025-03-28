'use client'
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

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
  diagnosis: string;
}

export default function PatientDetails() {
  const params = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await axios.get(`/api/patients/${params.id}`);
        setPatient(response.data.data);
      } catch (err) {
        console.log("Error>>>>>", err)
        setError('Failed to load patient data');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
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
      const response = await axios.delete(`/api/patients/${params.id}`);
      
      if (response.status === 200) {
        setIsDeleteModalOpen(false);
        router.push('/'); 
      } else {
        throw new Error('ไม่สามารถลบข้อมูลได้');
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการลบข้อมูล:', error);
      alert('ไม่สามารถลบข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };
  
  // Add this modal component just before the final return statement
  const DeleteConfirmationModal = () => {
    if (isDeleteModalOpen) {
      return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-xl w-full mx-4">
            <h3 className="text-2xl font-semibold mb-6">Delete Patient</h3>
            <p className="text-gray-600 mb-8 text-lg">
              Are you sure you want to delete this patient? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors text-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      );
    }else{
      return null;
    } 

   
  };
  

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        {isDeleteModalOpen && <DeleteConfirmationModal />}

      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <svg className="w-5 h-5 mr-2 transform transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Back to Patients List
        </Link>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header Section */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-400">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">Patient Details</h1>
                <p className="text-blue-100 mt-1">ID: {patient.id}</p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-yellow-500 rounded-lg text-white hover:bg-yellow-600 transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit</span>
                </button>
                <button 
                onClick={deletePatient}
                className="px-4 py-2 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
  
          <div className="p-6 space-y-8">
            {/* Status Card */}
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-xl">
                    {patient.first_name[0]}{patient.last_name[0]}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{`${patient.first_name} ${patient.last_name}`}</h2>
                  <p className="text-gray-500">
                    Patient since: {new Date(patient.created_at).toLocaleDateString('en-US')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Outstanding Balance</p>
                <p className={`text-lg font-semibold ${patient.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ₭ {patient.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
  
            {/* Main Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p className="text-base font-medium">{new Date(patient.birth_date).toLocaleDateString('en-US')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="text-base font-medium">{patient.age} years</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="text-base font-medium">{patient.gender === 'male' ? 'Male' : 'Female'}</p>
                  </div>
                </div>
              </div>
  
              {/* Contact Information */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="text-base font-medium">{patient.phone_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-base font-medium">{patient.address}</p>
                  </div>
                </div>
              </div>
            </div>
  
            {/* Medical Information */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Medical Information
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Diagnosis</p>
                  <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                    {patient.diagnosis || 'No information available'}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Medication</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {patient.medication || 'No information available'}
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