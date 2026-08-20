import { gql } from '@apollo/client';

export const GET_MY_TENANT_CONFIG = gql`
  query GetMyTenantConfig {
    tenant {
      id
      businessName
      logoUrl
      faviconUrl
      primaryColor
      secondaryColor
      themeName
      contactTelephone
      whatsappNumber
      supportEmail
      gstinCode
      currency
      paymentPublicKey
      paymentSandboxMode
    }
  }
`;
