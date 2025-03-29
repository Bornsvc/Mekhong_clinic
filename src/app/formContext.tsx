import { createContext, useContext, useState, ReactNode } from "react";

interface FormContextType {
  formActive: boolean;
  setFormactive: (active: boolean) => void;
  // isImportActive: boolean;
  // setIsImportActive: (active: boolean) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider = ({ children }: { children: ReactNode }) => {
  const [formActive, setFormactive] = useState(false);
  // const [isImportActive, setIsImportActive] = useState(false);

  return (
    <FormContext.Provider 
      value={{ 
        formActive, 
        setFormactive, 

      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useForm must be used within a FormProvider");
  }
  return context;
};