import React from 'react';

interface ClientCardProps {
  id: string;
  name: string;
  cloudProvider: string;
  status: string;
  onClick?: () => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({
  name,
  cloudProvider,
  status,
  onClick,
}) => {
  const providerColors: Record<string, string> = {
    azure: '#0078D4',
    aws: '#FF9900',
    gcp: '#4285F4',
  };

  const statusColors: Record<string, string> = {
    ready: '#22c55e',
    creating: '#eab308',
    error: '#ef4444',
  };

  return (
    <div
      onClick={onClick}
      style={{
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        cursor: 'pointer',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>{name}</h3>
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: statusColors[status] || '#6b7280',
          }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            padding: '4px 12px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            backgroundColor: providerColors[cloudProvider] || '#6b7280',
            color: 'white',
            fontWeight: '500',
          }}
        >
          {cloudProvider.toUpperCase()}
        </span>
        <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>
          {status}
        </span>
      </div>
    </div>
  );
};

export default ClientCard;
