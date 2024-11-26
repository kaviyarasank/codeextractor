// components/ExportButton.js
import React from 'react';

const ExportButton = ({ formName }:any) => {
  
  const handleExport = async () => {
    const response = await fetch(`/api/exportForm?formName=${formName}`);
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formName}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      alert('Failed to export form');
    }
  };

  return <button onClick={handleExport}>Export {formName} Form</button>;
};

export default ExportButton;
