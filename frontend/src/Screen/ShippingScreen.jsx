import React, { useContext, useState } from 'react';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Checkout from '../components/Checkout';
import { Store } from '../Store';

const ShippingScreen = () => {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    userInfo,
    cart: { shippingAddress },
  } = state;

  const [fullName, setFullName] = useState(shippingAddress.fullName || '');
  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [pinCode, setPinCode] = useState(shippingAddress.pinCode || '');
  const [country, setCountry] = useState(shippingAddress.country || '');

  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) {
      navigate('/signin?redirect=/shipping');
    }
  }, [userInfo, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    ctxDispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: {
        fullName,
        address,
        city,
        pinCode,
        country,
      },
    });

    localStorage.setItem(
      'shippingAddress',
      JSON.stringify({
        fullName,
        address,
        city,
        pinCode,
        country,
      })
    );
    navigate('/payment');
  };

  return (
    <>
      <Helmet>
        <title>Shipping Address</title>
      </Helmet>
      <Checkout step1 step2></Checkout>
      <div className="container form-width">
        <h2 className="m-3 text-center">Shipping Details</h2>
        <form onSubmit={submitHandler}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="form-control"
              id="name"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Address</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="form-control"
              id="address"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">City</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="form-control"
              id="address"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Pin Code</label>
            <input
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              required
              className="form-control"
              id="address"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Country</label>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              className="form-control"
              id="address"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Continue
          </button>
        </form>
      </div>
    </>
  );
};

export default ShippingScreen;
