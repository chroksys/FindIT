import React, { useState, useEffect } from 'react';
import { Phone, WarningCircle } from '@phosphor-icons/react';

interface PhoneInputProps {
  value: string;
  onChange: (val: string) => void;
  name?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

import { COUNTRY_CODES } from '../lib/phoneCodes';

export const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, name, required, placeholder, className, style }) => {
  const [countryCode, setCountryCode] = useState('+256');
  const [localNumber, setLocalNumber] = useState('');
  
  useEffect(() => {
    if (value) {
      const matchedCode = COUNTRY_CODES.find(c => value.startsWith(c.code));
      if (matchedCode) {
        setCountryCode(matchedCode.code);
        setLocalNumber(value.slice(matchedCode.code.length).trim());
      } else {
        setLocalNumber(value);
      }
    } else {
      setLocalNumber('');
    }
  }, [value]);

  const handleLocalNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/[^\d\s-]/g, '');
    setLocalNumber(newNumber);
    onChange(`${countryCode} ${newNumber.trim()}`);
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value;
    setCountryCode(newCode);
    if (localNumber) {
      onChange(`${newCode} ${localNumber.trim()}`);
    } else {
      onChange(`${newCode} `);
    }
  };

  const selectedCountryInfo = COUNTRY_CODES.find(c => c.code === countryCode);
  const maxLength = selectedCountryInfo ? selectedCountryInfo.maxLength : 15;
  const digitsOnly = localNumber.replace(/\D/g, '');
  const isTooLong = digitsOnly.length > maxLength;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', ...style }}>
      <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
        <select
          value={countryCode}
          onChange={handleCountryCodeChange}
          style={{
            padding: '12px',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--border-color, #e2e8f0)',
            backgroundColor: 'var(--bg-card, #fff)',
            color: 'var(--text-primary, #1e293b)',
            outline: 'none',
            width: '120px',
            boxSizing: 'border-box'
          }}
        >
          {COUNTRY_CODES.map(c => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
        <div style={{ position: 'relative', flex: 1 }}>
          <Phone size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            name={name}
            value={localNumber}
            onChange={handleLocalNumberChange}
            type="tel"
            required={required}
            className={className}
            style={className ? { paddingLeft: '40px', width: '100%', border: isTooLong ? '1px solid var(--color-error, #ef4444)' : undefined } : {
              width: '100%',
              padding: '12px 12px 12px 40px',
              borderRadius: 'var(--radius-md, 8px)',
              border: `1px solid ${isTooLong ? 'var(--color-error, #ef4444)' : 'var(--border-color, #e2e8f0)'}`,
              backgroundColor: 'var(--bg-card, #fff)',
              color: 'var(--text-primary, #1e293b)',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            placeholder={placeholder || 'Phone number'}
          />
        </div>
      </div>
      {isTooLong && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-error, #ef4444)', fontSize: '12px', marginTop: '4px', animation: 'fadeIn 0.2s ease-in' }}>
          <WarningCircle size={14} />
          <span>This number seems too long (expected {maxLength} digits, got {digitsOnly.length}).</span>
        </div>
      )}
    </div>
  );
};
