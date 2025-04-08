import React, { useState, useContext } from "react";
import { FormContext } from "@/app/page"; // Import the context
import Image from "next/image";
import ClodeIcon from "@/icons/close.png";
import axios from "axios";
import ConfirmClose from './confirmClose'

interface FormData {
  firstName: string;
  middleName: string;
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
  nationality: string;
  socialSecurityId: string;
  socialSecurityExpiration: string;
  socialSecurityCompany: string;
}

const CustomerForm: React.FC = () => {

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    middleName: "",
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
    nationality: "",
    socialSecurityId: "",
    socialSecurityExpiration: "",
    socialSecurityCompany: "",
  });

  const { setFormactive, setToastMassage, setSearchQuery } = useContext(FormContext); 
  const [comFirm, setComfirm] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedData: Partial<FormData> = { [name]: value };
    const formattedDate = value.split("T")[0];

    if (name === "birthDate") {
      // ตัดเวลาออกให้เหลือแค่ YYYY-MM-DD
      updatedData.birthDate = formattedDate;
      updatedData.socialSecurityExpiration = formattedDate;

      const birthYear = new Date(formattedDate).getFullYear();
      const currentYear = new Date().getFullYear();
      updatedData.age = currentYear - birthYear;

      console.log('updatedData.birthDate>>>>>',updatedData.birthDate)
    }

    if(name === 'socialSecurityExpiration'){
      updatedData.socialSecurityExpiration = formattedDate;
      console.log('updatedData.socialSecurityExpiration>>>>>',updatedData.socialSecurityExpiration)
    }

    setFormData((prevData) => ({ ...prevData, ...updatedData }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/patients', {
        first_name: formData.firstName,
        middle_name: formData.middleName,
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
        nationality: formData.nationality,
        social_security_id: formData.socialSecurityId,
        social_security_expiration: formData.socialSecurityExpiration,
        social_security_company: formData.socialSecurityCompany,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-all duration-300">
      <div className="max-w-4xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 relative">
        <Image
          src={ClodeIcon}
          alt="ClodeIcon"
          width={30}
          height={30}
          className="absolute top-6 right-6 cursor-pointer hover:opacity-75 hover:scale-110 transition-all duration-200"
          onClick={handleClose}
        />
        {comFirm ? <ConfirmClose comFirm={comFirm} setComfirm={setComfirm} /> : null}
        
        <div className="transform hover:scale-[1.01] transition-all duration-200">
          <h2 className="text-center text-5xl h-15 font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800 tracking-tight">
            ຂໍ້ມູນສ່ວນຕົວ
          </h2>
          <p className="mt-2 text-center text-base text-gray-600 animate-fade-in">
            ກະລຸນາຕື່ມລາຍລະອຽດຂ້າງລຸ່ມນີ້
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          {/* Personal Information Section */}
          <div className="space-y-6 bg-gray-50 p-6 rounded-xl transition-all duration-200 hover:shadow-md">
            <h3 className="text-2xl font-semibold text-gray-800 border-b pb-2">ຂໍ້ມູນສ່ວນຕົວ</h3>
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
                <label htmlFor="middleName" className="block text-base font-medium text-gray-700 mb-1">ຊື່ເລ່ນ</label>
                <input
                  id="middleName"
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-base font-medium text-gray-700 mb-1">ນາມສກຸນ</label>
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
                  readOnly
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 text-gray-900 rounded-lg bg-gray-50 cursor-not-allowed sm:text-sm"
                />
              </div>
            </div>

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
                  value={formData.phoneNumber}
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
                rows={4}
                value={formData.address}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
              ></textarea>
            </div>
          </div>

          {/* Social Security Information Section */}
          <div className="space-y-6 bg-gray-50 p-6 rounded-xl transition-all duration-200 hover:shadow-md">
            <h3 className="text-2xl font-semibold text-gray-800 border-b pb-2">ຂໍ້ມູນປະກັນສັງຄົມ</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="socialSecurityId" className="block text-base font-medium text-gray-700 mb-1">ເລກປະກັນສັງຄົມ</label>
                <input
                  id="socialSecurityId"
                  type="text"
                  name="socialSecurityId"
                  value={formData.socialSecurityId}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
                />
              </div>
              <div>
                <label htmlFor="socialSecurityExpiration" className="block text-base font-medium text-gray-700 mb-1">ວັນໝົດອາຍຸ</label>
                <input
                  id="socialSecurityExpiration"
                  type="date"
                  name="socialSecurityExpiration"
                  value={formData.socialSecurityExpiration}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
                />
              </div>
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

          {/* Medical Information Section */}
          <div className="space-y-6 bg-gray-50 p-6 rounded-xl transition-all duration-200 hover:shadow-md">
            <h3 className="text-2xl font-semibold text-gray-800 border-b pb-2">ຂໍ້ມູນທາງການແພດ</h3>
            <div>
              <label htmlFor="diagnosis" className="block text-base font-medium text-gray-700 mb-1">ການວິນິດໄຊ</label>
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
              <label htmlFor="medication" className="block text-base font-medium text-gray-700 mb-1">ຢາທີ່ໃຊ້</label>
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
          <div className="space-y-6 bg-gray-50 p-6 rounded-xl transition-all duration-200 hover:shadow-md">
            <h3 className="text-2xl font-semibold text-gray-800 border-b pb-2">ລາຍລະອຽດການລົງທະບຽນ</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="registered" className="block text-base font-medium text-gray-700 mb-1">ວັນທີລົງທະບຽນ</label>
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
                <label htmlFor="balance" className="block text-base font-medium text-gray-700 mb-1">ຍອດເງິນຄົງເຫຼືອ</label>
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
            className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-2xl font-bold rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
          >
            ເພີ່ມຂໍ້ມູນຄົນໄຂ້
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;
