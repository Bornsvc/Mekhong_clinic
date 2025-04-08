import React, { useState, useEffect, useContext } from "react";
import { FormContext } from "@/app/page";

type ConfirmCloseProps = {
  comFirm: boolean;
  setComfirm: React.Dispatch<React.SetStateAction<boolean>>;
};

const ConfirmClose: React.FC<ConfirmCloseProps> = ({ comFirm, setComfirm }) => {
  const { setFormactive } = useContext(FormContext);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (comFirm) {
      setTimeout(() => setIsVisible(true), 10); 
    } else {
      setIsVisible(false);
    }
  }, [comFirm]);

  const handleClickYes = () => {
    setFormactive(false);
    setComfirm(false);
  };

  const handleClickNo = () => {
    setIsVisible(false);
    setTimeout(() => setComfirm(false), 100); 
  };

  return comFirm ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
      <div
        className={`bg-white p-10 rounded-2xl shadow-2xl max-w-md w-full mx-4 text-center transform transition-all duration-300 ease-in-out
        ${isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          ເຈົ້າແນ່ໃຈບໍ່ວ່າຈະອອກ?
        </h1>
        <p className="text-gray-600 mb-8">
          ການປ່ຽນແປງທີ່ຍັງບໍ່ໄດ້ບັນທຶກຈະຖືກລຶບ.
        </p>
        <div className="space-y-3">
          <button
            onClick={handleClickYes}
            className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 
            transition-all duration-200 transform hover:-translate-y-0.5 
            font-semibold tracking-wide shadow-md hover:shadow-lg"
          >
            ອອກຈາກໜ້ານີ້
          </button>
          <button
            onClick={handleClickNo}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 
            transition-all duration-200 transform hover:-translate-y-0.5 
            font-semibold tracking-wide border border-gray-200"
          >
            ຢູ່ໜ້ານີ້ຕໍ່
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default ConfirmClose;
