import React, { useContext, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import { useEffect } from 'react';
import { getError } from '../error';
import { toast } from 'react-toastify';
import { API } from '../backend';

const SigninScreen = () => {
  const navigate = useNavigate();

  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${API}/api/users/signin`, {
        email,
        password,
      });
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate(redirect || '/');
    } catch (err) {
      toast.error(getError(err));
    }
  };

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, userInfo, redirect]);

  return (
    <>
      <Helmet>
        <title>Sign In</title>
      </Helmet>

      <div className="container" id="sign-in">
        <form onSubmit={submitHandler} className="account-form">
          <h2>Sign In</h2>
          <div className="input-field">
            <i className="fas fa-envelope"></i>
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="form-control"
              id="exampleInputEmail1"
              aria-describedby="emailHelp"
              placeholder="Email"
            />
          </div>
          <div className="input-field">
            <i className="fas fa-lock"></i>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="form-control"
              placeholder="Password"
              id="exampleInputPassword1"
            />
          </div>
          <button type="submit" className="form-btn">
            Sign In
          </button>
          <div className="mt-3 mb-3">
            New Customer?{' '}
            <Link to={`/signup?redirect=${redirect}`}>Create new account</Link>
          </div>
        </form>
      </div>
    </>
  );
};

export default SigninScreen;
