import React, { useContext, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Checkout from '../components/Checkout';
import { useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import { useState } from 'react';

const PaymentScreen = () => {
  const navigate = useNavigate();

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { shippingAddress, paymentMethod },
  } = state;

  const [paymentMethodName, setPaymentMethod] = useState(
    paymentMethod || 'Instamojo'
  );

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [shippingAddress, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    ctxDispatch({ type: 'SAVE_PAYMENT_METHOD', payload: paymentMethodName });
    localStorage.setItem('paymentMethod', paymentMethodName);
    navigate('/placeorder');
  };

  return (
    <>
      <Helmet>
        <title>Payment Method</title>
      </Helmet>
      <Checkout step1 step2 step3></Checkout>
      <div className="container form-width">
        <h2 className="m-3 text-center">Payment Method</h2>
        <form onSubmit={submitHandler}>
          <div className="mb-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="RazorPay"
                id="RazorPay"
                value="RazorPay"
                checked={paymentMethodName === 'RazorPay'}
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                }}
              />
              <label className="form-check-label">Razor Pay</label>
            </div>
            <div className="form-check mt-2">
              <input
                className="form-check-input"
                type="radio"
                name="Instamojo"
                id="Instamojo"
                value="Instamojo"
                checked={paymentMethodName === 'Instamojo'}
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                }}
              />
              <label className="form-check-label">Instamojo</label>
            </div>
            <button type="submit" className="btn btn-primary mt-2">
              Continue
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default PaymentScreen;
