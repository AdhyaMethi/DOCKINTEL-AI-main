import React from 'react';
import { User, Building2, Calendar, MapPin, DollarSign, Mail, Phone, Cpu, Box } from 'lucide-react';

export const EntityBadge = ({ type, value, count }) => {
  const t = (type || '').toUpperCase();

  let badgeClass = 'badge-tech';
  let Icon = Box;

  if (t === 'PERSON') { badgeClass = 'badge-person'; Icon = User; }
  else if (t === 'ORGANIZATION') { badgeClass = 'badge-org'; Icon = Building2; }
  else if (t === 'TECHNOLOGY') { badgeClass = 'badge-tech'; Icon = Cpu; }
  else if (t === 'MONEY') { badgeClass = 'badge-money'; Icon = DollarSign; }
  else if (t === 'DATE') { badgeClass = 'badge-date'; Icon = Calendar; }
  else if (t === 'LOCATION') { badgeClass = 'badge-loc'; Icon = MapPin; }
  else if (t === 'EMAIL') { badgeClass = 'badge-email'; Icon = Mail; }
  else if (t === 'PHONE') { badgeClass = 'badge-date'; Icon = Phone; }

  return (
    <span className={`badge ${badgeClass}`} title={`${type}: ${value}`}>
      <Icon size={12} />
      <span>{value}</span>
      {count > 1 && <span style={{ opacity: 0.7, fontSize: '0.7rem' }}>×{count}</span>}
    </span>
  );
};
