import React, { useState, useContext } from "react";
import { FormContext } from "@/app/page"; // Import the context
import Image from "next/image";
import ClodeIcon from "@/icons/close.png";
import axios from "axios";
import ConfirmClose from './confirmClose'

interface FormData {
  firstName: string;
  lastName: string;
  birthDate: string;
  age: number;
  address: string;
  phoneNumber: string;
  purpose: string;
  medication: string;
  registered: string;
  gender: string;
  balance: number;
  diagnosis: string;
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
    registered: new Date().toISOString().split('T')[0],
    gender: "",
    balance: 0,
    diagnosis: "",
  });

  const { setFormactive, setToastMassage, setSearchQuery } = useContext(FormContext); 
  const [comFirm, setComfirm] = useState<boolean>(false);

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
      const response = await axios.post('/api/patients', {
        first_name: formData.firstName,
        last_name: formData.lastName,
        birth_date: formData.birthDate,
        age: (formData.age),
        registered: new Date().toISOString(),
        phone_number: formData.phoneNumber,
        gender: formData.gender,
        medication: formData.medication,
        balance: formData.balance,
        diagnosis: formData.diagnosis || '',
        address: formData.address,
      });
  
      if (response.status === 200) {
        const token = localStorage.getItem('token');
        const responseUser = await axios.get('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}`}
        });
        if(responseUser.status === 200){
          const auditData = {
            userId: responseUser.data.userId,
            action: 'CREATE',
            resourceType: `${formData.firstName || ''} ${formData.lastName || ''}`,
            resourceId: response.data.data.id,
            details: JSON.stringify({
              changes: formData
            }),
            oldDetails: null
          };
          
          await axios.post('/api/audit', auditData);
        }
        setToastMassage(true);
        setFormactive(false);
        setSearchQuery("");
        console.log("Patient added successfully:", response.data.data);
      } else {
        setToastMassage(false);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setToastMassage(false);
    }
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
            ຂໍ້ມູນສ່ວນຕົວ
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ກະລຸນາຕື່ມລາຍລະອຽດຂ້າງລຸ່ມນີ້
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700">ຂໍ້ມູນສ່ວນຕົວ</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">ຊື່</label>
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
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">ນາມສະກຸນ</label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">ວັນເກີດ</label>
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
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">ອາຍຸ</label>
                <input
                  id="age"
                  type="number"
                  name="age"
                  value={formData.age}
                  readOnly
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 text-gray-900 rounded-lg bg-gray-50 cursor-not-allowed sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">ເພດ</label>
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
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">ເບີໂທລະສັບ</label>
                <input
                  id="phoneNumber"
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">ທີ່ຢູ່</label>
              <textarea
                id="address"
                name="address"
                rows={4}
                value={formData.address}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
              ></textarea>
            </div>
          </div>

          {/* Medical Information Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700">ຂໍ້ມູນທາງການແພດ</h3>
            <div>
              <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">ການວິນິດໄຊ</label>
              <textarea
                id="diagnosis"
                name="diagnosis"
                rows={4}
                value={formData.diagnosis}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
              ></textarea>
            </div>

            <div>
              <label htmlFor="medication" className="block text-sm font-medium text-gray-700 mb-1">ຢາທີ່ໃຊ້</label>
              <input
                id="medication"
                type="text"
                name="medication"
                value={formData.medication}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
              />
            </div>
          </div>

          {/* Registration Information Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700">ລາຍລະອຽດການລົງທະບຽນ</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="registered" className="block text-sm font-medium text-gray-700 mb-1">ວັນທີລົງທະບຽນ</label>
                <input
                  id="registered"
                  type="date"
                  name="registered"
                  value={formData.registered}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
                />
              </div>
              <div>
                <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-1">ຍອດເງິນຄົງເຫຼືອ</label>
                <input
                  id="balance"
                  type="number"
                  name="balance"
                  value={formData.balance}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-xl font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 ease-in-out transform hover:-translate-y-1"
          >
            ເພີ່ມຂໍ້ມູນຄົນໄຂ້
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;
