import React, { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import ImageUploadWidget from './ImageUploadWidget';

// Define the GraphQL Mutation
const UPDATE_TENANT_BRANDING = gql`
  mutation UpdateTenantBranding($input: UpdateTenantInput!) {
    updateTenant(input: $input) {
      id
      businessName
      logoUrl
      primaryColor
      themeName
    }
  }
`;

// Define TypeScript interfaces for the form data
interface TenantFormData {
  businessName: string;
  logoUrl: string;
  primaryColor: string;
  themeName: string;
}

interface Props {
  tenant?: any;
}

const TenantBrandingForm: React.FC<Props> = ({ tenant }) => {
  // Local state for the form inputs
  const [formData, setFormData] = useState<TenantFormData>({
    businessName: '',
    logoUrl: '',
    primaryColor: '#ff0000',
    themeName: 'dark-theme',
  });

  useEffect(() => {
    if (tenant) {
      setFormData({
        businessName: tenant.businessName || '',
        logoUrl: tenant.logoUrl || '',
        primaryColor: tenant.primaryColor || '#ff0000',
        themeName: tenant.themeName || 'dark-theme',
      });
    }
  }, [tenant]);

  // Initialize the useMutation hook
  const [updateTenant, { data, loading, error }] = useMutation<any>(UPDATE_TENANT_BRANDING);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Execute the mutation with the input variables
      await updateTenant({
        variables: {
          input: {
            businessName: formData.businessName,
            logoUrl: formData.logoUrl,
            primaryColor: formData.primaryColor,
            themeName: formData.themeName,
          },
        },
      });
      alert('Branding updated successfully!');
    } catch (err) {
      console.error('Error updating tenant branding:', err);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h2>Update Tenant Branding</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Business Name</label>
          <br />
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <ImageUploadWidget 
            userToken={localStorage.getItem('token') || ''} 
            onImageUploaded={(url) => setFormData(prev => ({ ...prev, logoUrl: url }))} 
          />
          <input type="hidden" name="logoUrl" value={formData.logoUrl} required />
        </div>

        <div>
          <label>Primary Color</label>
          <br />
          <input
            type="color"
            name="primaryColor"
            value={formData.primaryColor}
            onChange={handleChange}
            style={{ width: '100%', height: '40px' }}
          />
        </div>

        <div>
          <label>Theme</label>
          <br />
          <select
            name="themeName"
            value={formData.themeName}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="light-theme">Light</option>
            <option value="dark-theme">Dark</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Updating...' : 'Save Branding'}
        </button>

        {/* Display Success or Error Messages */}
        {error ? <p style={{ color: 'red' }}>Error: {error.message}</p> : null}
        {data ? (
          <p style={{ color: 'green' }}>
            Success! Changed to {data.updateTenant.businessName}
          </p>
        ) : null}
      </form>
    </div>
  );
};

export default TenantBrandingForm;
