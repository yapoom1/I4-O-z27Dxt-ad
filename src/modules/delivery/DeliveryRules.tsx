import React, { useState } from 'react';
import { Card, CardContent, CardHeader, Button } from '@/shared/ui/Primitives';
import { Plus, Trash2, Settings, ArrowRight, ShieldCheck, Truck, User } from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_DELIVERY_RULES, GET_DELIVERY_AGENTS } from '@/shared/graphql/queries/delivery';
import { GET_ORDERS } from '@/shared/graphql/queries/orders';
import { CREATE_DELIVERY_RULE, UPDATE_DELIVERY_RULE, DELETE_DELIVERY_RULE, CREATE_DELIVERY_AGENT, UPDATE_DELIVERY_AGENT_STATUS, DELETE_DELIVERY_AGENT } from '@/shared/graphql/mutations/delivery';

interface DeliveryRule {
  id: string;
  field: 'Weight' | 'Order Price' | 'City' | 'Payment Method';
  operator: 'greater than' | 'less than' | 'equals';
  value: string;
  carrier: 'Own Delivery' | 'Shiprocket' | 'Delhivery' | 'BlueDart' | 'DTDC' | 'Xpressbees';
}

export const DeliveryRules: React.FC = () => {
  const { data, loading, error, refetch } = useQuery<any>(GET_DELIVERY_RULES);

  React.useEffect(() => {
    if (error) {
      window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Failed to load delivery rules.', type: 'error' } }));
    }
  }, [error]);

  const [createRule] = useMutation(CREATE_DELIVERY_RULE);
  const [updateRule] = useMutation(UPDATE_DELIVERY_RULE);
  const [deleteRule] = useMutation(DELETE_DELIVERY_RULE);

  const { data: agentsData, refetch: refetchAgents } = useQuery<any>(GET_DELIVERY_AGENTS);
  const { data: ordersData } = useQuery<any>(GET_ORDERS);
  
  const [createAgent] = useMutation(CREATE_DELIVERY_AGENT);
  const [updateAgentStatus] = useMutation(UPDATE_DELIVERY_AGENT_STATUS);
  const [deleteAgent] = useMutation(DELETE_DELIVERY_AGENT);

  const rules: DeliveryRule[] = data?.deliveryRules || [];
  const agents: any[] = agentsData?.deliveryAgents || [];
  const activeOrders: any[] = (ordersData?.tenantOrders || []).filter((o: any) => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED');

  const handleAddRule = async () => {
    try {
      await createRule({
        variables: {
          input: {
            field: 'Weight',
            operator: 'greater than',
            value: '5kg',
            carrier: 'BlueDart',
          }
        }
      });
      refetch();
      window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Rule created successfully.', type: 'success' } }));
    } catch (e) {
      window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Failed to create rule.', type: 'error' } }));
    }
  };

  const handleUpdateRule = async (id: string, fields: Partial<DeliveryRule>) => {
    try {
      await updateRule({
        variables: {
          ruleId: id,
          input: { ...fields }
        }
      });
      refetch();
      window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Rule updated successfully.', type: 'success' } }));
    } catch (e) {
      window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Failed to update rule.', type: 'error' } }));
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      await deleteRule({ variables: { ruleId: id } });
      refetch();
      window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Rule deleted successfully.', type: 'success' } }));
    } catch (e) {
      window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Failed to delete rule.', type: 'error' } }));
    }
  };

  const handleAddAgent = async () => {
    const name = window.prompt("Enter agent's name:");
    if (!name) return;
    const zone = window.prompt("Enter agent's zone (e.g., Chennai Central):");
    if (!zone) return;
    
    try {
      await createAgent({ variables: { name, zone } });
      refetchAgents();
      window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Agent added.', type: 'success' } }));
    } catch(e) {
      window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Error adding agent.', type: 'error' } }));
    }
  };

  const handleToggleAgentStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'offline' ? 'idle' : currentStatus === 'idle' ? 'on-route' : 'offline';
    try {
      await updateAgentStatus({ variables: { agentId: id, status: nextStatus } });
      refetchAgents();
      window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Agent status updated.', type: 'success' } }));
    } catch(e) {
      window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Error updating agent status.', type: 'error' } }));
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if(!window.confirm('Delete this agent?')) return;
    try {
      await deleteAgent({ variables: { agentId: id } });
      refetchAgents();
      window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Agent deleted.', type: 'success' } }));
    } catch(e) {
      window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Error deleting agent.', type: 'error' } }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground m-0">Delivery Management</h1>
        <p className="text-xs text-muted-foreground">Manage logistics rules, own delivery fleet, and track active outgoing orders.</p>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Courier Partners & Own Agents - 1 Column */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Own Delivery Fleet</h3>
              <button
                onClick={handleAddAgent}
                className="inline-flex items-center gap-1.5 h-7 px-2 rounded bg-primary/10 text-primary hover:bg-primary/20 text-[10px] font-semibold cursor-pointer transition-colors"
              >
                <Plus className="h-3 w-3" /> New Agent
              </button>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border text-xs">
              {agents.map((ag) => (
                <div key={ag.id} className="p-3 flex items-center justify-between hover:bg-muted/10 transition-colors">
                  <div className="flex gap-2.5 items-center">
                    <span className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                      <User className="h-4 w-4" />
                    </span>
                    <div>
                      <span className="font-semibold text-foreground block">{ag.name}</span>
                      <span className="text-[10px] text-muted-foreground">{ag.zone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div className="flex flex-col items-end">
                      <button 
                        onClick={() => handleToggleAgentStatus(ag.id, ag.status)}
                        className={`inline-flex items-center px-1.5 py-0.5 text-[8px] font-bold rounded-full border cursor-pointer hover:opacity-80 transition-opacity ${ag.status === 'on-route' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : ag.status === 'idle' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-secondary text-secondary-foreground border-border'}`}
                      >
                        {ag.status}
                      </button>
                      <span className="text-[9px] text-muted-foreground block mt-0.5">{ag.activeOrders || 0} orders active</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteAgent(ag.id)}
                      className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Active Deliveries Tracking */}
      <div>
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-foreground">Active Deliveries Tracking</h3>
            <p className="text-xs text-muted-foreground">Live overview of orders currently being processed or out for delivery.</p>
          </CardHeader>
          <CardContent className="p-0">
            {activeOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">No active deliveries to track at the moment.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-muted/30 text-muted-foreground border-y border-border uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Order #</th>
                      <th className="py-3 px-4 font-semibold">Customer</th>
                      <th className="py-3 px-4 font-semibold">Delivery Mode</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold">Placed On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {activeOrders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                        <td className="py-3 px-4 font-medium text-foreground">
                          {order.id.split('-')[0]}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-foreground">{order.deliveryAddress?.customerName || order.user?.name || 'Unknown'}</div>
                          <div className="text-[10px] text-muted-foreground">{order.deliveryAddress?.phoneNumber || '-'}</div>
                        </td>
                        <td className="py-3 px-4">
                          {order.deliveryService || 'Unassigned'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                            order.orderStatus === 'OUT_FOR_DELIVERY' ? 'bg-amber-500/10 text-amber-500' :
                            order.orderStatus === 'SHIPPED' ? 'bg-blue-500/10 text-blue-500' :
                            'bg-secondary text-secondary-foreground'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
