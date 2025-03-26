import React, { useState, useContext } from "react";
import { FormContext } from "@/app/page"; // Import the context
import Image from "next/image";
import ClodeIcon from "@/icons/close.png";
import ConfirmClose from "@/components/confirmClose";
import axios from "axios";

interface FormData {
  firstName: string;
  lastName: string;
  birthDate: string;
  age: number;
  address: string;
  phoneNumber: string;
  purpose: string;
  medication: string;
  gender: string; 
  registered: string;   
  diagnosis: string;     
  balance: number; 
}

const CustomerForm: React.FC = () => {

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    birthDate: "",
    age: 0,
    address: "",
    phoneNumber: "",
    purpose: "",
    medication: "",
    gender: '',
    registered: new Date().toISOString().split('T')[0],
    diagnosis: '',
    balance: 0
  });

  const { setFormactive, setToastMassage, setSearchQuery } = useContext(FormContext); 
  const [comFirm, setComfirm] = useState<boolean>(false);

  
  const handleChange = (e: React.ChangeEvent< HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement >) => {
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
    console.log('Submitting data:', {
      first_name: formData.firstName,
      last_name: formData.lastName,
      birth_date: formData.birthDate,
      age: formData.age,
      address: formData.address,
      phone_number: formData.phoneNumber,
      purpose: formData.purpose,
      medication: formData.medication,
      gender: formData.gender,
      registered: formData.registered,
      diagnosis: formData.diagnosis,
      balance: formData.balance
    });
    try {
      const response = await axios.post('/api/patients', {
        first_name: formData.firstName,
        last_name: formData.lastName,
        birth_date: formData.birthDate,
        age: formData.age,
        address: formData.address,
        phone_number: formData.phoneNumber, 
        purpose: formData.purpose, 
        medication: formData.medication, 
        gender: formData.gender,
        registered: formData.registered,
        diagnosis: formData.diagnosis,
        balance: formData.balance
      });

      if(response.data.success) {
        setToastMassage(true); 
        setFormactive(false); 
        setSearchQuery(""); 
        console.log("Form submitted: ", formData);
      }else {
        setToastMassage(false); 
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาด:', error);
      setToastMassage(false);
    }
    setFormactive(false);
  };
  

  const handleClose = () => {
    setComfirm(true);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-lg relative">
        <Image
          src={ClodeIcon}
          alt="ClodeIcon"
          width={30}
          height={30}
          className="absolute top-6 right-6 cursor-pointer hover:opacity-75 transition-opacity"
          onClick={handleClose}
        />
        {comFirm ? <ConfirmClose comFirm={comFirm} setComfirm={setComfirm} /> : null}
        
        <div>
          <h2 className="text-center text-4xl font-extrabold text-gray-900 tracking-tight">
            Customer Information
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please fill in the details below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
            />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            <input
              type="date"
              name="registered"
              value={formData.registered}
              onChange={handleChange}
              placeholder="Registration Date"
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
            />
            <input
              type="number"
              name="age"
              value={formData.age}
              readOnly
              placeholder="Age"
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg bg-gray-50 cursor-not-allowed sm:text-sm"
            />
          </div>

          <textarea
            name="address"
            rows={5}
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
            className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
          ></textarea>

          <textarea
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            placeholder="Diagnosis"
            className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
            rows={5}
          ></textarea>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Phone Number"
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
            />
            <input
              type="text"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="Purpose of Use"
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
            />
          </div>

          <input
            type="text"
            name="medication"
            value={formData.medication}
            onChange={handleChange}
            placeholder="Medication Used"
            className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
          />
          
          <input
            type="number"
            name="balance"
            value={formData.balance}
            onChange={handleChange}
            placeholder="Balance"
            className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
            min="0"
            step="0.01"
          />
          

          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-xl font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 ease-in-out transform hover:-translate-y-1"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;
