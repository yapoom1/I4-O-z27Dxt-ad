import { gql } from '@apollo/client';

export const RECORD_PAYMENT = gql`
  mutation RecordPayment($orderId: UUID!, $amount: Float!, $paymentMethod: String!, $transactionReference: String, $status: String!) {
    recordPayment(orderId: $orderId, amount: $amount, paymentMethod: $paymentMethod, transactionReference: $transactionReference, status: $status) {
      id
    }
  }
`;

export const REQUEST_ORDER_RETURN = gql`
  mutation RequestOrderReturn($input: RequestReturnInput!) {
    requestOrderReturn(input: $input) {
      id
    }
  }
`;

export const APPROVE_ORDER_RETURN = gql`
  mutation ApproveOrderReturn($returnId: UUID!, $approved: Boolean!) {
    approveOrderReturn(returnId: $returnId, approved: $approved) {
      id
    }
  }
`;

export const COMPLETE_ORDER_RETURN = gql`
  mutation CompleteOrderReturn($returnId: UUID!, $refundAmount: Float!) {
    completeOrderReturn(returnId: $returnId, refundAmount: $refundAmount) {
      id
    }
  }
`;

export const ADD_TO_CART = gql`
  mutation AddToCart($productId: UUID!, $quantity: Int!) {
    addToCart(productId: $productId, quantity: $quantity) {
      id
    }
  }
`;

export const CLEAR_CART = gql`
  mutation ClearCart {
    clearCart {
      id
    }
  }
`;

export const SELECT_DELIVERY_OPTION = gql`
  mutation SelectDeliveryOption($addressId: UUID!, $serviceName: String!) {
    selectDeliveryOption(addressId: $addressId, serviceName: $serviceName) {
      id
    }
  }
`;

export const CHECKOUT_CART = gql`
  mutation CheckoutCart($paymentMethod: String!) {
    checkoutCart(paymentMethod: $paymentMethod) {
      id
      grandTotal
      orderStatus
      paymentStatus
      createdAt
    }
  }
`;

export const CREATE_USER_ADDRESS = gql`
  mutation CreateUserAddress($input: CreateUserAddressInput!) {
    createUserAddress(input: $input) {
      id
    }
  }
`;

export const UPDATE_ORDER_DELIVERY_STATUS = gql`
  mutation UpdateOrderDeliveryStatus($orderId: UUID!, $status: String!) {
    updateOrderDeliveryStatus(orderId: $orderId, status: $status) {
      id
      orderStatus
    }
  }
`;

export const UPDATE_ORDER_PAYMENT_STATUS = gql`
  mutation UpdateOrderPaymentStatus($orderId: UUID!, $status: String!) {
    updateOrderPaymentStatus(orderId: $orderId, status: $status) {
      id
      paymentStatus
    }
  }
`;
