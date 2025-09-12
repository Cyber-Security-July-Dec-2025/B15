import React from 'react';

const StatusMessage = ({ status }) => {
  if (!status.message) return null;
  return (
    <div className={`status-message-toast ${status.type}`}>
      <span className="status-message-toast__icon">
        {status.type === 'success' ? '' : '⚠️'}
      </span>
      <span>{status.message}</span>
    </div>
  );
};

export default StatusMessage;