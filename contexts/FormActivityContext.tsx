'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type InputActivity = 'name' | 'email' | 'password' | 'submit' | null;

interface FormActivityContextType {
  inputActivity: InputActivity;
  setInputActivity: (activity: InputActivity) => void;
}

const FormActivityContext = createContext<FormActivityContextType | undefined>(
  undefined
);

export function FormActivityProvider({ children }: { children: ReactNode }) {
  const [inputActivity, setInputActivity] = useState<InputActivity>(null);

  return (
    <FormActivityContext.Provider value={{ inputActivity, setInputActivity }}>
      {children}
    </FormActivityContext.Provider>
  );
}

export function useFormActivity() {
  const context = useContext(FormActivityContext);
  if (context === undefined) {
    throw new Error('useFormActivity must be used within FormActivityProvider');
  }
  return context;
}