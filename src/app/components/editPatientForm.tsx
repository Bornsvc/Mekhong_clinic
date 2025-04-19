'use client'
import React, { useState, useEffect } from "react";
import Image from "next/image";
import ClodeIcon from "@/icons/close.png";
import axios from "axios";
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import { getCurrentUserId } from '@/utils/auth';

interface EditPatientFormProps {
  patientId: string;
  onClose: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  birthDate: string;
  middle_name: string
  age: number;
  address: string;
  phoneNumber: string;
  purpose: string;
  medication: string;
  gender: string;
  balance: number;
  diagnosis: string;
  nationality?: string; // เพิ่ม
  socialSecurityId?: string; // เพิ่ม
  socialSecurityExpiration?: string; // เพิ่ม
  socialSecurityCompany?: string; // เพิ่ม
}

const EditPatientForm: React.FC<EditPatientFormProps> = ({ patientId, onClose }) => {
  
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    middle_name:"",
    birthDate: "",
    age: 0,
    address: "",
    phoneNumber: "",
    purpose: "",
    medication: "",
    gender: "",
    balance: 0,
    diagnosis: "",
    nationality: "",
    socialSecurityId: "",
    socialSecurityExpiration: "",
    socialSecurityCompany: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // const router = useRouter();

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await axios.get(`/api/patients/${patientId}`);
        const patient = response.data;
        setFormData({
          firstName: patient.first_name,
          lastName: patient.last_name,
          middle_name: patient.middle_name,
          birthDate: new Date(patient.birth_date).toISOString().split('T')[0],
          age: patient.age,
          address: patient.address,
          phoneNumber: patient.phone_number,
          purpose: patient.purpose || '',
          medication: patient.medication || '',
          gender: patient.gender,
          balance: patient.balance,
          diagnosis: patient.diagnosis || '',
          nationality: patient.nationality || '',
          socialSecurityId: patient.social_security_id || '',
          socialSecurityExpiration: patient.social_security_expiration ? new Date(patient.social_security_expiration).toISOString().split('T')[0] : '',
          socialSecurityCompany: patient.social_security_company || ''
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching patient:", err);
        setError('Failed to load patient data');
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedData: Partial<FormData> = { [name]: value };

    if (name === "birthDate") {
      const birthYear = new Date(value).getFullYear();
      const currentYear = new Date().getFullYear();
      updatedData.age = currentYear - birthYear;
    }

    setFormData((prevData) => ({ ...prevData, ...updatedData }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.birthDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        alert('Please input date of birth follow this format YYYY-MM-DD');
        return;
      }

      const updateData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        middle_name: formData.middle_name,
        birth_date: formData.birthDate, 
        age: formData.age,
        phone_number: formData.phoneNumber,
        gender: formData.gender,
        medication: formData.medication || null,
        balance: Number(formData.balance),
        diagnosis: formData.diagnosis || null,
        address: formData.address || null,
        nationality: formData.nationality || null,
        social_security_id: formData.socialSecurityId || null,
        social_security_expiration: formData.socialSecurityExpiration || null,
        social_security_company: formData.socialSecurityCompany || null
      };

     

      const response = await axios.put(`/api/patients/${patientId}`, updateData);
      console.log(response)
      window.location.reload();
      onClose();
    } catch (error) {
      console.error('Error updating patient:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Cannot update patient data';
        alert(errorMessage);
      } else {
        alert('Something went wrong. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-xl w-full mx-4">
          <p className="text-red-500 text-center">{error}</p>
          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full my-8 relative mx-4">
        <div className=" bg-white pb-4 z-10">
          <Image
            src={ClodeIcon}
            alt="CloseIcon"
            width={30}
            height={30}
            className="absolute top-6 right-6 cursor-pointer hover:opacity-75 transition-opacity"
            onClick={onClose}
          />
        
          <div>
            <h2 className="text-center text-5xl font-extrabold text-gray-900 ">
              ແກ້ໄຂຂໍ້ມູນຜູ້ປ່ວຍ
            </h2>
            <p className="mt-2 text-center text-base text-gray-600">
              ອັບເດດລາຍລະອຽດຂອງຜູ້ປ່ວຍຂ້າງລຸ່ມນີ້
            </p>
          </div>
        </div>
    
        <form onSubmit={handleSubmit} className="mt-8">
           {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700">ຂໍ້ມູນສ່ວນໂຕ</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-base font-medium text-gray-700 mb-1">ຊື່</label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-base font-medium text-gray-700 mb-1">ນາມສະກຸນ</label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
                />
              </div>
              <div>
                <label htmlFor="middle_name" className="block text-base font-medium text-gray-700 mb-1">ຊື່ເລ່ນ</label>
                <input
                  id="middle_name"
                  type="text"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="birthDate" className="block text-base font-medium text-gray-700 mb-1">ວັນເກີດ</label>
                <input
                  id="birthDate"
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
                />
              </div>
              <div>
                <label htmlFor="age" className="block text-base font-medium text-gray-700 mb-1">ອາຍຸ</label>
                <input
                  id="age"
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 text-gray-900 rounded-lg bg-gray-50 cursor-not-allowed sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="gender" className="block text-base font-medium text-gray-700 mb-1">ເພດ</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
                >
                  <option value="">ເລືອກເພດ</option>
                  <option value="male">ຊາຍ</option>
                  <option value="female">ຍິງ</option>
                  <option value="other">ອື່ນໆ</option>
                </select>
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-base font-medium text-gray-700 mb-1">ເບີໂທລະສັບ</label>
                <input
                  id="phoneNumber"
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber || ''}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-base font-medium text-gray-700 mb-1">ທີ່ຢູ່</label>
              <textarea
                id="address"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                rows={3}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
              />
            </div>
          </div>

          {/* Social Security Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700">ຂໍ້ມູນປະກັນສັງຄົມ</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="nationality" className="block text-base font-medium text-gray-700 mb-1">ສັນຊາດ</label>
                <input
                  id="nationality"
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
                />
              </div>
              <div>
                <label htmlFor="socialSecurityId" className="block text-base font-medium text-gray-700 mb-1">ເລກທີປະກັນສັງຄົມ</label>
                <input
                  id="socialSecurityId"
                  type="text"
                  name="socialSecurityId"
                  value={formData.socialSecurityId}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="socialSecurityExpiration" className="block text-base font-medium text-gray-700 mb-1">ວັນໝົດອາຍຸປະກັນສັງຄົມ</label>
                <input
                  id="socialSecurityExpiration"
                  type="date"
                  name="socialSecurityExpiration"
                  value={formData.socialSecurityExpiration}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
                />
              </div>
              <div>
                <label htmlFor="socialSecurityCompany" className="block text-base font-medium text-gray-700 mb-1">ບໍລິສັດປະກັນ</label>
                <input
                  id="socialSecurityCompany"
                  type="text"
                  name="socialSecurityCompany"
                  value={formData.socialSecurityCompany}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700">ຂໍ້ມູນການແພດ</h3>
            <div>
              <label htmlFor="diagnosis" className="block text-base font-medium text-gray-700 mb-1">ການວິນິໄສ</label>
              <textarea
                id="diagnosis"
                name="diagnosis"
                value={formData.diagnosis || ''}
                onChange={handleChange}
                rows={4}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
              />
            </div>

            <div>
              <label htmlFor="medication" className="block text-base font-medium text-gray-700 mb-1">ຢາທີ່ໃຊ້</label>
              <textarea
                id="medication"
                name="medication"
                value={formData.medication || ''}
                onChange={handleChange}
                rows={4}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
              />
            </div>

            {/* <div>
              <label htmlFor="balance" className="block text-base font-medium text-gray-700 mb-1">ຍອດ</label>
              <input
                id="balance"
                type="number"
                name="balance"
                value={formData.balance}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
              />
            </div> */}
          </div>

          <div className="flex justify-end space-x-4 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-lg"
            >
              ຍົກເລີກ
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-lg"
            >
              ບັນທຶກການປ່ຽນແປງ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPatientForm;