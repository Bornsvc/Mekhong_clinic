"use client"
import { createContext, useState, useEffect, Dispatch, SetStateAction, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PatientForm from './components/patientForm'
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import ImportFile from './components/importPatientForm'
import Pagination from './components/Pagination'

import ExportIcon from '@/icons/export.png'
import UploadIcon from '@/icons/import.png'
import LOGO from '@/icons/LOGO.png'
import Image from 'next/image';
import PtientIcon from '@/icons/patient.png'
import AddPtientIcon from '@/icons/Addpatient.png'
import LogOutIcon from '@/icons/logout.png'

interface Patient {
  id: string;
  first_name: string;
  middle_name: string;
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
  nationality: string;
  social_security_id: string;
  social_security_expiration: string;
  social_security_company: string;
}

interface FormContextType {
  formActive: boolean;
  setFormactive: Dispatch<SetStateAction<boolean>>;
  setToastMassage: React.Dispatch<React.SetStateAction<boolean | null>>;
  toastMassage: null | boolean;
  setSearchQuery: React.Dispatch<SetStateAction<string>>;
  setIsImportActive: Dispatch<SetStateAction<boolean>>;
}

const FormContext = createContext<FormContextType>({
  formActive: false,
  toastMassage: null,
  setFormactive: () => {},
  setToastMassage: () => {},
  setSearchQuery: () => {},
  setIsImportActive: () => {}
});

export default function Home() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [active, setActive] = useState<boolean>(false);
  const [formActive, setFormactive] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMassage, setToastMassage] = useState<boolean | null>(null);
  const [patients, setPatients] = useState<Patient[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isImportActive, setIsImportActive] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [itemsPerPage] = useState<number>(11);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchPatients = useCallback(async () => {
    try {
      const response = await axios.get(`/api/patients?page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}`);
      setPatients(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch(error) {
      console.log("Error from fetchPatients function>>>", error)
      toast.error("Failed to load patients");
    }
  }, [currentPage, itemsPerPage, searchQuery]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    setActive(true);
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }
        const response = await axios.get('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.authenticated) {
          setIsAuthenticated(true);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error("Error from login", error)
        router.push('/login');
        localStorage.removeItem('token');
      }
    };

    checkAuth();
    fetchPatients();
  }, [fetchPatients, router]); 

  useEffect(() => {
    if (toastMassage === true) {
      toast.success("Successfully to add patient!");
      setToastMassage(null);
      fetchPatients(); 
    } else if (toastMassage === false) {
      toast.error("Fail to add patient!");
      setToastMassage(null);
    }
  }, [toastMassage, fetchPatients]); 

  useEffect(() => {
    fetchPatients();
  }, [currentPage, itemsPerPage, searchQuery, fetchPatients]); 

  const renderPagination = () => {
    return (
      <div className="flex flex-col items-center gap-4 mt-4 mb-8">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  }

  const handleOpenForm = () => {
    setFormactive(true);
  };

  if (!isMounted) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <FormContext.Provider value={{ formActive, setFormactive, toastMassage, setToastMassage, setSearchQuery, setIsImportActive }}>
      {isMounted && (
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          theme="colored"
        />
      )}

      {formActive ? <PatientForm />  : (
        <div>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <nav className="sticky top-0 z-20 bg-gradient-to-r from-blue-600 to-blue-400 shadow-lg">
              <div className="flex mx-auto px-4 py-3 sm:px-6">
                <div className="flex items-center gap-3 sm:gap-6">
                  <Image 
                    src={LOGO}
                    alt='LOGO'
                    className='w-12 h-12 rounded-full bg-white'
                  />
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-wide">MEKONG CLINIC</h1>
                </div>
              </div>
            </nav>

            <div className="flex flex-col md:flex-row flex-1 h-[calc(100vh-4rem)]">
              <div className="w-full md:w-72 lg:w-64 relative bg-white mr-0 md:mr-3 shadow-lg border-b md:border-b-0">
                <div className="md:hidden flex justify-between items-center p-4 border-b mt-5 transition-all duration-500">
                  <span className="font-medium text-gray-700">Menu</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      className={`w-6 h-6 transition-transform duration-200 ${isMobileMenuOpen ? 'transform rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={isMobileMenuOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                      />
                    </svg>
                  </button>
                </div>

                <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col justify-between h-[calc(100%-60px)] md:h-full`}>
                  <div 
                    className={`flex items-center gap-4 p-4 cursor-pointer transition-all duration-200 justify-center md:justify-start
                      ${active ? 'bg-blue-50 border-r-4 border-blue-500' : 'hover:bg-gray-50'}`}
                  >
                    <Image src={PtientIcon} alt="Patient" width={24} height={24} />
                    <span className="font-medium text-gray-700 inline">ຄົນໄຂ້</span>
                  </div>

                  <div 
                    className={`flex items-center gap-4 p-4 w-full cursor-pointer justify-center md:justify-start hover:bg-gray-50`}
                      onClick={handleLogout}
                  >
                    <Image src={LogOutIcon} alt="LogOutIcon" width={24} height={24} />
                    <span className="font-medium text-gray-700 text-lg inline">ອອກຈາກລະບົບ</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-0">
                <div className="p-4 mr-3 md:p-6 bg-gray-50 rounded-lg shadow-md border border-gray-200 mt-3 mb-3">
                  <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                    <div className="relative w-full md:w-96">
                      <input
                        type="text"
                        placeholder="ຄົ້ນຫາຜູ້ປ່ວຍ..."
                        onChange={(e) => {
                          setSearchQuery((e.target.value));
                          setCurrentPage(1);
                        }}
                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      />
                    </div>
                    <div className="flex items-center gap-6 mr-10">
                    <div className="flex justify-center items-center gap-5">
                        {/* Import Button with Tooltip */}
                        <div className="relative group rounded-full hover:bg-gray-200 p-2 flex items-center">
                          <button 
                            onClick={() => setIsImportActive(!isImportActive)}
                          >
                            <Image src={UploadIcon} alt="Import" width={24} height={24} />
                          </button>

                          {/* Tooltip */}
                          <span className="absolute -top-7 left-1/2 -translate-x-25 whitespace-nowrap 
                                          bg-gray-700 text-white text-sm px-3 py-1 rounded-lg rounded-br-none 
                                          shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                            Import File
                          </span>
                        </div>

                        {/* Export Button */}
                        <div className="relative group">
                          <button 
                            onClick={async () => {
                              try {
                                const response = await axios.get('/api/patients/all');
                                if (response.data) {
                                  const { exportPatientsToExcel } = await import('../utils/exportToExcel');
                                  exportPatientsToExcel(response.data);
                                }
                              } catch (error) {
                                console.error('Export failed:', error);
                                toast.error('Failed to export patients data');
                              }
                            }}
                            className="rounded-full hover:bg-gray-200 p-2 flex items-center"
                          >
                            <Image src={ExportIcon} alt="Export" width={24} height={24} />
                          </button>

                          {/* Tooltip */}
                          <span className="absolute -top-7 left-1/2 -translate-x-25 whitespace-nowrap 
                                          bg-gray-700 text-white text-sm px-3 py-1 rounded-lg rounded-br-none 
                                          shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                            Export File
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={handleOpenForm}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95 transition-all duration-300 w-full md:w-auto"
                      >
                        <Image src={AddPtientIcon} alt="Add" width={24} height={24} />
                        <span>ເພິ້ມຄົນໄຂ້</span>
                      </button>
                      {isImportActive ?  <ImportFile /> : null}
                    </div>
                  </div>
                </div>

                <div className="flex-1 mr-3 overflow-hidden bg-white rounded-lg shadow-md border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          ລະຫັດ
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          ຊື່ / ນາມສະກຸນ
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          ວັນ / ເດືອນ / ປີເກີດ
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          ອາຍຸ
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          ລົງທະບຽນ
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          ເພດ
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          ເບີໂທລະສັບ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {patients.map((patient, index) => (
                        <tr key={index} className="hover:bg-blue-50 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-base text-gray-900">{patient.id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-base font-medium text-blue-600 hover:text-blue-800">
                              <Link href={`/patients/${patient.id}`}>{`${patient.first_name} ${patient.last_name} (${patient.middle_name})`}</Link>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-base text-gray-900">
                              {formatDate(patient.birth_date)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-base text-gray-900">{patient.age}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-base text-gray-900">
                              {formatDate(patient.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-base text-gray-900 capitalize">{patient.gender}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-base text-gray-900">{patient.phone_number}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {renderPagination()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </FormContext.Provider>
  );
}

export { FormContext };

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};