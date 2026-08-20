import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, Input, Select, Switch, Button } from '@/shared/ui/Primitives';
import { Settings as SettingsIcon, Shield, CreditCard, Bell, Key, Save } from 'lucide-react';
import TenantBrandingForm from '@/shared/components/TenantBrandingForm';
import ShiprocketSettingsForm from '@/shared/components/ShiprocketSettingsForm';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_MY_TENANT_CONFIG } from '@/shared/graphql/queries/tenant';
import { UPDATE_TENANT_GENERAL, UPDATE_TENANT_API_KEYS } from '@/shared/graphql/mutations/tenant';

export const Settings: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'store' | 'tax' | 'api' | 'branding' | 'shipping'>('store');

  // Form State
  const [formState, setFormState] = useState({
    businessName: '',
    contactTelephone: '',
    whatsappNumber: '',
    supportEmail: '',
    gstinCode: '',
    currency: 'INR',
  });

  const [apiForm, setApiForm] = useState({
    paymentPublicKey: '',
    paymentSecretKey: '',
    paymentSandboxMode: true,
  });

  const { data: tenantData } = useQuery<any>(GET_MY_TENANT_CONFIG);

  useEffect(() => {
    if (tenantData?.tenant) {
      setFormState({
        businessName: tenantData.tenant.businessName || '',
        contactTelephone: tenantData.tenant.contactTelephone || '',
        whatsappNumber: tenantData.tenant.whatsappNumber || '',
        supportEmail: tenantData.tenant.supportEmail || '',
        gstinCode: tenantData.tenant.gstinCode || '',
        currency: tenantData.tenant.currency || 'INR',
      });
      setApiForm({
        paymentPublicKey: tenantData.tenant.paymentPublicKey || '',
        paymentSecretKey: '',
        paymentSandboxMode: tenantData.tenant.paymentSandboxMode ?? true,
      });
    }
  }, [tenantData]);

  const [updateTenantGeneral, { loading: isUpdating }] = useMutation(UPDATE_TENANT_GENERAL, {
    onCompleted: () => {
      window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Settings saved successfully', type: 'success' } }));
    },
    onError: () => {
      window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Failed to save settings', type: 'error' } }));
    }
  });

  const handleSave = () => {
    updateTenantGeneral({
      variables: {
        input: {
          businessName: formState.businessName,
          contactTelephone: formState.contactTelephone,
          whatsappNumber: formState.whatsappNumber,
          supportEmail: formState.supportEmail,
          gstinCode: formState.gstinCode,
          currency: formState.currency,
        }
      }
    });
  };

  const [updateTenantApi, { loading: isUpdatingApi }] = useMutation(UPDATE_TENANT_API_KEYS, {
    onCompleted: () => {
      window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'API Keys saved successfully', type: 'success' } }));
    },
    onError: () => {
      window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Failed to save API Keys', type: 'error' } }));
    }
  });

  const handleSaveApi = () => {
    updateTenantApi({
      variables: {
        input: {
          payment_public_key: apiForm.paymentPublicKey || null,
          payment_secret_key: apiForm.paymentSecretKey || null,
          payment_sandbox_mode: apiForm.paymentSandboxMode
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground m-0">Store Settings</h1>
          <p className="text-xs text-muted-foreground">Adjust tenant metadata configurations, taxes, API endpoints, and currencies.</p>
        </div>

        <div className="flex items-center gap-1 bg-secondary p-1 rounded-md border border-border animate-fade-in">
          <button 
            onClick={() => setActiveSubTab('store')}
            className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer ${activeSubTab === 'store' ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            General Settings
          </button>
          <button 
            onClick={() => setActiveSubTab('branding')}
            className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer ${activeSubTab === 'branding' ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Tenant Branding
          </button>
          <button 
            onClick={() => setActiveSubTab('shipping')}
            className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer ${activeSubTab === 'shipping' ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Shipping Integrations
          </button>
        </div>
      </div>

      {activeSubTab === 'store' && (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <Card className="bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">General Profile Settings</h3>
                <Button size="sm" onClick={handleSave} disabled={isUpdating}>
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Saving...' : 'Save Settings'}
                </Button>
              </CardHeader>
              <CardContent className="p-4 space-y-4 text-xs">
                <Input
                  label="Official Store Legal Name"
                  value={formState.businessName}
                  onChange={(e) => setFormState({ ...formState, businessName: e.target.value })}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Contact Telephone"
                    value={formState.contactTelephone}
                    onChange={(e) => setFormState({ ...formState, contactTelephone: e.target.value })}
                  />
                  <Input
                    label="WhatsApp Notification Number"
                    value={formState.whatsappNumber}
                    onChange={(e) => setFormState({ ...formState, whatsappNumber: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Store Support Email"
                    value={formState.supportEmail}
                    onChange={(e) => setFormState({ ...formState, supportEmail: e.target.value })}
                  />
                  <Input
                    label="Registered GSTIN Code"
                    value={formState.gstinCode}
                    onChange={(e) => setFormState({ ...formState, gstinCode: e.target.value })}
                  />
                </div>
                <Select
                  label="Transactional Currency"
                  value={formState.currency}
                  options={[
                    { label: 'Indian Rupee (₹)', value: 'INR' },
                    { label: 'United States Dollar ($)', value: 'USD' },
                    { label: 'European Euro (€)', value: 'EUR' }
                  ]}
                  onChange={(e: any) => setFormState({ ...formState, currency: e.target.value })}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-card">
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="font-semibold text-foreground pb-2 border-b border-border">Tenant Account Details</div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Subscription</span>
                  <span className="font-semibold text-primary">Enterprise</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registered Branch Nodes</span>
                  <span>3 Active Branches</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeSubTab === 'tax' && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-foreground">Tax Matrix Rules</h3>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left text-xs divide-y divide-border">
              <thead className="bg-muted/40">
                <tr className="text-muted-foreground font-bold">
                  <th className="p-3">Country / Region</th>
                  <th className="p-3">VAT/GST Code</th>
                  <th className="p-3 text-right">Tax Rate (%)</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                <tr>
                  <td className="p-3 font-semibold">United States (State VAT)</td>
                  <td className="p-3 font-mono">US-VAT-2022</td>
                  <td className="p-3 text-right font-semibold">8.5%</td>
                  <td className="p-3 text-emerald-500 font-semibold">Active</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">European Union (VAT)</td>
                  <td className="p-3 font-mono">EU-VAT-Standard</td>
                  <td className="p-3 text-right font-semibold">19.0%</td>
                  <td className="p-3 text-emerald-500 font-semibold">Active</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">India (Integrated GST)</td>
                  <td className="p-3 font-mono">IN-IGST-Goods</td>
                  <td className="p-3 text-right font-semibold">18.0%</td>
                  <td className="p-3 text-emerald-500 font-semibold">Active</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {activeSubTab === 'api' && (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <span>Developer Credentials API Keys</span>
                </div>
                <Button size="sm" onClick={handleSaveApi} disabled={isUpdatingApi}>
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdatingApi ? 'Saving...' : 'Save API Keys'}
                </Button>
              </CardHeader>
              <CardContent className="p-4 space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block text-muted-foreground font-semibold">Live Production Public Token</label>
                  <input
                    type="text"
                    className="w-full h-8 px-2 rounded border border-border bg-background font-mono text-[10px] text-foreground"
                    value={apiForm.paymentPublicKey}
                    onChange={(e) => setApiForm({ ...apiForm, paymentPublicKey: e.target.value })}
                    placeholder="pk_live_..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-muted-foreground font-semibold">Live Secret API Key</label>
                  <input
                    type="password"
                    className="w-full h-8 px-2 rounded border border-border bg-background font-mono text-[10px] text-foreground"
                    value={apiForm.paymentSecretKey}
                    onChange={(e) => setApiForm({ ...apiForm, paymentSecretKey: e.target.value })}
                    placeholder="Enter new secret key to update (leave blank to keep unchanged)"
                  />
                </div>

                <Switch
                  checked={apiForm.paymentSandboxMode}
                  onChange={(val) => setApiForm({ ...apiForm, paymentSandboxMode: val })}
                  label="Force Sandbox Mock Environment"
                  description="Averts execution of financial payouts. Perfect for testing layout webhooks."
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeSubTab === 'branding' && (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <Card className="bg-card">
            <CardHeader>
              <h3 className="text-sm font-semibold text-foreground">Tenant Branding</h3>
            </CardHeader>
            <CardContent className="p-4">
              <TenantBrandingForm tenant={tenantData?.tenant} />
            </CardContent>
          </Card>
        </div>
      )}

      {activeSubTab === 'shipping' && (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <Card className="bg-card">
            <CardHeader>
              <h3 className="text-sm font-semibold text-foreground">Shiprocket Courier Setup</h3>
            </CardHeader>
            <CardContent className="p-4">
              <ShiprocketSettingsForm />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
