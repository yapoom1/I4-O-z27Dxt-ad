import React, { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';

const GET_SHIPROCKET_SETTINGS = gql`
  query GetShiprocketSettings {
    tenant {
      id
      shiprocketEmail
    }
  }
`;

const UPDATE_SHIPROCKET_SETTINGS = gql`
  mutation UpdateShiprocketSettings($input: UpdateTenantInput!) {
    updateTenant(input: $input) {
      id
      shiprocketEmail
    }
  }
`;

const ShiprocketSettingsForm: React.FC = () => {
  const [formData, setFormData] = useState({
    shiprocketEmail: '',
    shiprocketPassword: ''
  });

  const { data: queryData, loading: queryLoading } = useQuery<any>(GET_SHIPROCKET_SETTINGS);

  React.useEffect(() => {
    if (queryData?.tenant?.shiprocketEmail) {
      setFormData(prev => ({ ...prev, shiprocketEmail: queryData.tenant.shiprocketEmail }));
    }
  }, [queryData]);

  const [updateSettings, { loading: mutLoading, error, data }] = useMutation(UPDATE_SHIPROCKET_SETTINGS);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await updateSettings({
        variables: {
          input: {
            shiprocketEmail: formData.shiprocketEmail || null,
            shiprocketPassword: formData.shiprocketPassword || null
          }
        }
      });
      alert('Shiprocket settings updated successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  if (queryLoading) return <div className="text-xs">Loading settings...</div>;

  return (
    <div style={{ padding: '10px' }}>
      <p className="text-xs text-muted-foreground mb-4">Connect your Shiprocket account to automate delivery fulfillment and show live rates.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1">Shiprocket Email</label>
          <input
            type="email"
            name="shiprocketEmail"
            className="w-full border rounded px-2 py-1.5 text-xs bg-background text-foreground"
            value={formData.shiprocketEmail}
            onChange={handleChange}
            placeholder="Enter your Shiprocket account email"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Shiprocket Password</label>
          <input
            type="password"
            name="shiprocketPassword"
            className="w-full border rounded px-2 py-1.5 text-xs bg-background text-foreground"
            value={formData.shiprocketPassword}
            onChange={handleChange}
            placeholder="Enter a new password to update (leave blank to keep current)"
          />
        </div>
        <button
          type="submit"
          disabled={mutLoading}
          className="bg-primary text-primary-foreground px-4 py-2 rounded text-xs font-bold"
        >
          {mutLoading ? 'Saving...' : 'Save Settings'}
        </button>
        {error && <p className="text-red-500 text-xs mt-2">{error.message}</p>}
        {data ? <p className="text-emerald-500 text-xs mt-2">Saved successfully!</p> : null}
      </form>
    </div>
  );
};

export default ShiprocketSettingsForm;
