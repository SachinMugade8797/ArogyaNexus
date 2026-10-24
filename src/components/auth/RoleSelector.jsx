import React from 'react';
import { User, Stethoscope, Shield } from 'lucide-react';

export default function RoleSelector({ selectedRole, onSelectRole }) {
  const roles = [
    {
      id: 'patient',
      label: 'Patient',
      icon: User,
      description: 'Access records & appointments'
    },
    {
      id: 'doctor',
      label: 'Doctor',
      icon: Stethoscope,
      description: 'Manage clinic & patient consultations'
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: Shield,
      description: 'Platform governance & administration'
    }
  ];

  const handleKeyDown = (e, index) => {
    let nextIndex = null;
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % roles.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + roles.length) % roles.length;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      onSelectRole(roles[nextIndex].id);
    }
  };

  return (
    <div className="role-selector-group">
      <span className="role-selector-label" id="role-selector-label">
        Continue as
      </span>
      <div 
        className="role-selector-grid" 
        role="tablist" 
        aria-labelledby="role-selector-label"
      >
        {roles.map((role, idx) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;
          return (
            <button
              key={role.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-label={`Select ${role.label} role - ${role.description}`}
              className={`role-tab-btn ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectRole(role.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              tabIndex={isSelected ? 0 : -1}
            >
              <Icon className="role-tab-icon" />
              <span>{role.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
