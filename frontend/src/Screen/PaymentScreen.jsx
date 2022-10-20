import React, { useContext, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Checkout from '../components/Checkout';
import { useNavigate } from 'react-router-dom';
import { Store } from '../Store';

const PaymentScreen = () => {
  const navigate = useNavigate();

  const { state } = useContext(Store);

  const {
    cart: { shippingAddress },
  } = state;

  useEffect(() => {
    if (!shippingAddress) {
      navigate('/shipping');
    }
  }, [shippingAddress, navigate]);

  return (
    <>
      <Helmet>
        <title>Shipping Address</title>
      </Helmet>
      <Checkout step1 step2 step3></Checkout>

      <div className="container m-5">
        <div className="alert alert-danger" role="alert">
          Sorry! The payment service will be available soon.
        </div>
      </div>
    </>
  );
};

export default PaymentScreen;
