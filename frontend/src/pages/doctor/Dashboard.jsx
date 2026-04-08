import React, { useState } from 'react';
import { createClinic } from '../../api/clinic';

export default function Dashboard() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !address.trim()) {
      alert("Please enter both a clinic name and an address.");
      return;
    }
    
    setLoading(true);
    
    try {
      const data = await createClinic({ name: name, address: address });
      alert(`✅ Success! Created Clinic ID: ${data.id}`);
      setName('');
      setAddress('');
    } catch (error) {
      console.error("Failed to create clinic:", error);
      const detail = error.response?.data?.detail || error.message;
      alert(`❌ Error creating clinic: ${detail}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto', border: '1px solid #ccc', borderRadius: '8px', marginTop: '50px' }}>
      <h1>Doctor Dashboard</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Clinic Name</label>
        <input
          placeholder="e.g. City General"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: '8px', width: '100%', marginBottom: '10px' }}
          disabled={loading}
        />
        
        <label style={{ display: 'block', marginBottom: '5px' }}>Address</label>
        <input
          placeholder="e.g. 123 Health St."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{ padding: '8px', width: '100%', marginBottom: '10px' }}
          disabled={loading}
        />
      </div>

      <button 
        onClick={handleCreate} 
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          width: '100%',
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer' 
        }}
      >
        {loading ? 'Saving...' : 'Create Clinic'}
      </button>
    </div>
  );
}
