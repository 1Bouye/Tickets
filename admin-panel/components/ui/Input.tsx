import React, { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showPasswordToggle?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  type,
  showPasswordToggle = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password' && showPasswordToggle;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={isPasswordField && showPassword ? 'text' : type}
          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white ${
            error ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
          } ${isPasswordField ? 'pr-12' : ''} ${type === 'date' ? 'cursor-text' : ''} ${className}`}
          {...props}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none hover:scale-110 transition-transform duration-200 p-1 rounded-lg hover:bg-gray-100"
          >
            {showPassword ? (
              <span className="text-xl">👁️</span>
            ) : (
              <span className="text-xl">👁️‍🗨️</span>
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm font-medium text-red-600 flex items-center gap-1">
          <span>⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
};

