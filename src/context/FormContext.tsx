import { createContext, Dispatch, SetStateAction } from 'react';

export interface FormContextType {
  formActive: boolean;
  setFormactive: Dispatch<SetStateAction<boolean>>;
  setToastMassage: React.Dispatch<React.SetStateAction<boolean | null>>;
  toastMassage: null | boolean;
  setSearchQuery: React.Dispatch<SetStateAction<string>>;
  setIsImportActive: Dispatch<SetStateAction<boolean>>;
}

export const FormContext = createContext<FormContextType>({
  formActive: false,
  toastMassage: null,
  setFormactive: () => {},
  setToastMassage: () => {},
  setSearchQuery: () => {},
  setIsImportActive: () => {}
});