
import { useState, useCallback, ChangeEvent } from 'react';

export interface FormField {
  value: string | number;
  error?: string;
  touched?: boolean;
}

export interface FormState {
  [key: string]: FormField;
}

export interface UseSimpleFormOptions {
  initialValues: Record<string, string | number>;
  validate?: (values: Record<string, string | number>) => Record<string, string>;
  onSubmit: (values: Record<string, string | number>) => void | Promise<void>;
}

export const useSimpleForm = ({ initialValues, validate, onSubmit }: UseSimpleFormOptions) => {
  const [formState, setFormState] = useState<FormState>(() => {
    const state: FormState = {};
    Object.keys(initialValues).forEach(key => {
      state[key] = {
        value: initialValues[key],
        error: undefined,
        touched: false,
      };
    });
    return state;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((name: string, value: string | number) => {
    setFormState(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
        touched: true,
        error: undefined,
      },
    }));
  }, []);

  const setError = useCallback((name: string, error: string) => {
    setFormState(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        error,
      },
    }));
  }, []);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? Number(value) : value;
    setValue(name, finalValue);
  }, [setValue]);

  const validateForm = useCallback(() => {
    if (!validate) return true;

    const values: Record<string, string | number> = {};
    Object.keys(formState).forEach(key => {
      values[key] = formState[key].value;
    });

    const errors = validate(values);
    let hasErrors = false;

    Object.keys(errors).forEach(key => {
      if (errors[key]) {
        setError(key, errors[key]);
        hasErrors = true;
      }
    });

    return !hasErrors;
  }, [formState, validate, setError]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const values: Record<string, string | number> = {};
      Object.keys(formState).forEach(key => {
        values[key] = formState[key].value;
      });
      
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formState, validateForm, onSubmit]);

  const reset = useCallback(() => {
    const state: FormState = {};
    Object.keys(initialValues).forEach(key => {
      state[key] = {
        value: initialValues[key],
        error: undefined,
        touched: false,
      };
    });
    setFormState(state);
  }, [initialValues]);

  const getFieldProps = useCallback((name: string) => ({
    name,
    value: formState[name]?.value || '',
    onChange: handleChange,
    error: formState[name]?.error,
  }), [formState, handleChange]);

  const values = Object.keys(formState).reduce((acc, key) => {
    acc[key] = formState[key].value;
    return acc;
  }, {} as Record<string, string | number>);

  const errors = Object.keys(formState).reduce((acc, key) => {
    if (formState[key].error) {
      acc[key] = formState[key].error;
    }
    return acc;
  }, {} as Record<string, string>);

  const hasErrors = Object.keys(errors).length > 0;

  return {
    values,
    errors,
    hasErrors,
    isSubmitting,
    setValue,
    setError,
    handleChange,
    handleSubmit,
    reset,
    getFieldProps,
  };
};
