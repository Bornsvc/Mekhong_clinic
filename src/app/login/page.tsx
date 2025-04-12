'use client'
import React, { useState, FormEvent, ChangeEvent, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import ShowIcon from '@/icons/show.png'
import hide from '@/icons/hide.png'
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormContext } from "@/context/FormContext";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [textOrPasswprd, setTextOrPassword] = useState('password');
  const { setToastMassage } = useContext(FormContext)

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });
      console.log("response>>>>>>>>>>>>",response)

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      localStorage.setItem('token', data.token);
      if (formData.rememberMe) {
        localStorage.setItem('username', formData.username);
      } else {
        localStorage.removeItem('username');
      }
      
      toast.success('ເຂົ້າລະບົບສຳເລັດ!');
      setToastMassage(true)
      setTimeout(() => {
        router.push('/');
        setIsLoading(false);
      }, 1000); 
    } catch (error) {
      setIsLoading(false);
      console.error("Error>>>>>>",error);
      toast.error('ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ.');
    } 
  };

  const hideShowPassword = () => {
    setTextOrPassword(prevState => prevState === "password" ? "text" : "password");
  }

  return (
    <div className="min-h-screen relative flex items-start text-xl justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
       
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          theme="colored"
        />
  
      <div className="max-w-md w-full space-y-8 mt-[10%] z-10">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
            Welcome to <span className='text-blue-500'>Mekhong Clinic</span>
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg">
          <div className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-lg font-medium text-gray-700">
                ຊື່ຜູ້ໃຊ້
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition duration-150 ease-in-out"
                placeholder="ໃສ່ຊື່ຜູ້ໃຊ້"
              />
            </div>

            <div className='relative'>
              <label htmlFor="password" className="block text-lg font-medium text-gray-700">
                ລະຫັດຜ່ານ
              </label>
              <input
                type={textOrPasswprd}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition duration-150 ease-in-out"
                placeholder="ໃສ່ລະຫັດຜ່ານ"
              />
              <Image 
              src={textOrPasswprd === 'password' ? hide : ShowIcon}
              alt='ShowIcon'
              width={30}
              height={30}
              className='absolute right-3 bottom-[5px] opacity-50'
              onClick={hideShowPassword}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white
                       ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                       transition-colors duration-200`}
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : null}
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}