import React from 'react';
import './Tabs.css';

interface TabsProps {
  labels: string[];
  activeIndex: number;
  onTabChange: (index: number) => void;
  children: React.ReactNode;
}

const Tabs: React.FC<TabsProps> = ({ labels, activeIndex, onTabChange, children }) => {
  return (
    <div className="tabs-container">
      <div className="tabs-header">
        {labels.map((label, idx) => (
          <button
            key={label}
            className={`tab-btn${activeIndex === idx ? ' active' : ''}`}
            onClick={() => onTabChange(idx)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
      <div className="tabs-content">
        {children}
      </div>
    </div>
  );
};

export default Tabs; 