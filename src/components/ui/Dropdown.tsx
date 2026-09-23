import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import './Dropdown.css';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface Props {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

const Dropdown: React.FC<Props> = ({ value, options, onChange, placeholder, icon }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className={`ui-dropdown ${open ? 'open' : ''}`} ref={ref}>
      <button
        type="button"
        className="ui-dropdown-trigger"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {icon && <span className="trigger-icon">{icon}</span>}
        <span className="trigger-label">{selected?.label || placeholder}</span>
        <ChevronDown size={14} className={`trigger-chevron ${open ? 'rotated' : ''}`} />
      </button>

      {open && (
        <div className="ui-dropdown-menu" role="listbox">
          {options.map(opt => (
            <button
              key={opt.value}
              role="option"
              aria-selected={value === opt.value}
              className={`ui-dropdown-item ${value === opt.value ? 'active' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.icon && <span className="item-icon">{opt.icon}</span>}
              <span className="item-label">{opt.label}</span>
              {value === opt.value && <Check size={14} className="item-check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
