import { gql } from '@apollo/client';

export const CREATE_DELIVERY_RULE = gql`
  mutation CreateDeliveryRule($input: DeliveryRuleInput!) {
    createDeliveryRule(input: $input) {
      id
      field
      operator
      value
      carrier
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_DELIVERY_RULE = gql`
  mutation UpdateDeliveryRule($ruleId: UUID!, $input: UpdateDeliveryRuleInput!) {
    updateDeliveryRule(ruleId: $ruleId, input: $input) {
      id
      field
      operator
      value
      carrier
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_DELIVERY_RULE = gql`
  mutation DeleteDeliveryRule($ruleId: UUID!) {
    deleteDeliveryRule(ruleId: $ruleId)
  }
`;

export const CREATE_DELIVERY_AGENT = gql`
  mutation CreateDeliveryAgent($name: String!, $zone: String!) {
    createDeliveryAgent(name: $name, zone: $zone) {
      id
      name
      zone
      activeOrders
      status
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_DELIVERY_AGENT_STATUS = gql`
  mutation UpdateDeliveryAgentStatus($agentId: UUID!, $status: String!) {
    updateDeliveryAgentStatus(agentId: $agentId, status: $status) {
      id
      name
      zone
      activeOrders
      status
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_DELIVERY_AGENT = gql`
  mutation DeleteDeliveryAgent($agentId: UUID!) {
    deleteDeliveryAgent(agentId: $agentId)
  }
`;
