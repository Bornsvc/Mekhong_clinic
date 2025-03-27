'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await axios.get(`/api/patients/${params.id}`);
        setPatient(response.data.data);
      } catch (err) {
        console.log(err)
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-400">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">
                Patient Details
              </h1>
              <Link
                href="/"
                className="text-white hover:text-blue-100 transition-colors duration-200"
              >
                Back to List
              </Link>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="text-base text-gray-900">{`${patient.first_name} ${patient.last_name}`}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="text-base text-gray-900">{new Date(patient.birth_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Age</p>
                    <p className="text-base text-gray-900">{patient.age}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="text-base text-gray-900 capitalize">{patient.gender}</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="text-base text-gray-900">{patient.phone_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-base text-gray-900">{patient.address}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Purpose of Visit</p>
                  <p className="text-base text-gray-900">{patient.purpose || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Medication</p>
                  <p className="text-base text-gray-900">{patient.medication || 'None'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Diagnosis</p>
                  <p className="text-base text-gray-900">{patient.diagnosis || 'Not available'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Balance</p>
                  <p className="text-base text-gray-900">${patient.balance.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="text-sm text-gray-500">
                <p>Patient since: {new Date(patient.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}