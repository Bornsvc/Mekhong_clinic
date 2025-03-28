"use client"
import Image from 'next/image';
import PtientIcon from '@/icons/patient.png'
import AddPtientIcon from '@/icons/Addpatient.png'
import LogOutIcon from '@/icons/logout.png'
import { createContext, useState, useEffect, Dispatch, SetStateAction } from 'react';
import PatientForm from './components/patientForm'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import LoginFrom from './loginPage'
import Link from 'next/link';
import UploadIcon from '@/icons/import.png'
import ImportFile from './components/importPatientForm'
import Pagination from './components/Pagination'

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
  diagnosis: string
}

interface FormContextType {
  formActive: boolean;
  setFormactive: Dispatch<SetStateAction<boolean>>;
  setToastMassage: React.Dispatch<React.SetStateAction<boolean | null>>;
  toastMassage: null | boolean;
  setSearchQuery: React.Dispatch<SetStateAction<string>>;
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
  setIsImportActive: Dispatch<SetStateAction<boolean>>;
}

const FormContext = createContext<FormContextType>({
  formActive: false,
  toastMassage: null,
  setFormactive: () => {},
  setToastMassage: () => {},
  setSearchQuery: () => {},
  setIsAuthenticated: () => {},
  setIsImportActive: () => {}
});

export default function Home() {
  const [active, setActive] = useState<boolean>(false);
  const [formActive, setFormactive] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMassage, setToastMassage] = useState<boolean | null>(null);
  const [patients, setPatients] = useState<Patient[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isImportActive, setIsImportActive] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [itemsPerPage] = useState<number>(11);

  const fetchPatients = async() => {
    try {
      const response = await axios.get(`/api/patients?page=${currentPage}&limit=${itemsPerPage}`);
      setPatients(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      console.log('Fetched patients:', response.data);
    } catch(error) {
      console.log("Error fetching API", error);
      toast.error("Failed to load patients");
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // const handleItemsPerPageChange = (newLimit: number) => {
  //   setItemsPerPage(newLimit);
  //   setCurrentPage(1); // Reset to first page when changing items per page
  // };

  useEffect(() => {
    setActive(true);
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAuthenticated(true);
          return;
        }
        // Verify token with backend
        const response = await axios.get('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(response)
        setIsAuthenticated(true);
      } catch (error) {
        console.log("Error from login", error)
        setIsAuthenticated(false);
        localStorage.removeItem('token');
      }
    };

    checkAuth();
    fetchPatients()
  }, [])

  useEffect(() => {
    if (toastMassage === true) {
      toast.success("Successfully to add patient!");
      setToastMassage(null);
      fetchPatients(); 
    } else if (toastMassage === false) {
      toast.error("Fail to add patient!");
      setToastMassage(null);
    }
  }, [toastMassage]);
  

  const handleActive = () => {
    setActive(true)
  };

  const filteredPatients = patients.filter(patient => {
    const searchWords = searchQuery.toLowerCase().trim().split(/\s+/); 
    const firstName = patient.first_name?.toLowerCase() || '';
    const lastName = patient.last_name?.toLowerCase() || '';
    const phone = patient.phone_number?.toLowerCase() || '';
  
    return searchWords.every(word => 
      firstName.includes(word) || 
      lastName.includes(word) || 
      phone.includes(word)
    );
  });
  
  const handleOpenForm = () => {
    setFormactive(!formActive)
  }
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  }


  useEffect(() => {
    fetchPatients();
  }, [currentPage, itemsPerPage]);

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

  return (
    <FormContext.Provider value={{ formActive, setFormactive, toastMassage, setToastMassage, setSearchQuery, setIsAuthenticated, setIsImportActive }}>
      
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        theme="colored"
      />

    { !isAuthenticated ? (  <LoginFrom setIsAuthenticated={setIsAuthenticated} /> ) :
      formActive ? ( <PatientForm /> ) : 
      
      (

      <div>
        <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Bar */}
        <nav className="sticky top-0 z-20 bg-gradient-to-r from-blue-600 to-blue-400 shadow-lg">
          <div className="container mx-auto px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3 sm:gap-6">
              <h1 className="text-xl md:text-2xl lg:text-2xl font-bold text-white">LOGO</h1>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-wide">MEKHONG CLINIC</h1>
            </div>
          </div>
        </nav>

        <div className="flex flex-col md:flex-row flex-1 h-[calc(100vh-4rem)]">
        {/* Sidebar */}
          <div className="w-full md:w-72 lg:w-64 relative bg-white mr-0 md:mr-3 shadow-lg border-b md:border-b-0">
            {/* Mobile Menu Button */}
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

            {/* Menu Items */}
            <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col justify-between h-[calc(100%-60px)] md:h-full`}>
              <div 
                onClick={handleActive}
                className={`flex items-center gap-4 p-4 cursor-pointer transition-all duration-200 justify-center md:justify-start
                  ${active ? 'bg-blue-50 border-r-4 border-blue-500' : 'hover:bg-gray-50'}`}
              >
                <Image src={PtientIcon} alt="Patient" width={24} height={24} />
                <span className="font-medium text-gray-700 inline">Patients</span>
              </div>

              <div 
                className={`flex items-center gap-4 p-4 w-full cursor-pointer justify-center md:justify-start hover:bg-gray-50`}
                onClick={handleLogout}
              >
                <Image src={LogOutIcon} alt="LogOutIcon" width={24} height={24} />
                <span className="font-medium text-gray-700 inline">Log out</span>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-0">
            {/* Search Bar */}
            <div className="p-4 md:p-6 bg-gray-50 rounded-lg shadow-md border border-gray-200 mt-3 mb-3">
              <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                <div className="relative w-full md:w-96">
                  <input
                    type="text"
                    placeholder="Search patients..."
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-6 mr-10">
                  <button
                    onClick={handleOpenForm}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95 transition-all duration-300 w-full md:w-auto"
                  >
                    <Image src={AddPtientIcon} alt="Add" width={24} height={24} />
                    <span>Add Patient</span>
                  </button>

                  <button 
                    onClick={() => setIsImportActive(!isImportActive)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all duration-300 w-full md:w-auto"
                  >
                    <Image src={UploadIcon} alt="Import" width={24} height={24} />
                    <span>Import File</span>
                  </button>
                  {isImportActive ?  <ImportFile /> : null}
                </div>
              </div>
            </div>

           {/* Table Container */}
            <div className="flex-1 overflow-hidden bg-white rounded-lg shadow-md border border-gray-200">
           
                
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        UHID
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        FullName
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        DOB
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Age
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registered
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gender
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mobile
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPatients.map((patient, index) => (
                      <tr key={index} className="hover:bg-blue-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{patient.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-blue-600 hover:text-blue-800">
                            <Link href={`/patients/${patient.id}`}>{`${patient.first_name} ${patient.last_name}`}</Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(patient.birth_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{patient.age}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(patient.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">{patient.gender}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{patient.phone_number}</div>
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
      
      )
    }
    </FormContext.Provider>
  );

}


export { FormContext };