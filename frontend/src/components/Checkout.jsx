import React from 'react';

const Checkout = (props) => {
  return (
    <>
      <div className="container-fluid">
        <div className="row checkout-steps">
          <div className={`col ${props.step1 ? 'active' : ''}`}>Sign In</div>
          <div className={`col ${props.step2 ? 'active' : ''}`}>Shipping</div>
          <div className={`col ${props.step3 ? 'active' : ''}`}>Payment</div>
          <div className={`col ${props.step4 ? 'active' : ''}`}>
            Place Order
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
