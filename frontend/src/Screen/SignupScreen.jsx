import React, { useContext, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import { useEffect } from 'react';
import { getError } from '../error';
import { toast } from 'react-toastify';

const SignupScreen = () => {
  const navigate = useNavigate();

  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const { data } = await axios.post('/api/users/signup', {
        name,
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
        <title>Sign Up</title>
      </Helmet>

      <div className="container form-width">
        <div className="m-4">
          <h2>Sign Up</h2>
        </div>

        <form onSubmit={submitHandler}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              onChange={(e) => setName(e.target.value)}
              type="name"
              required
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              required
              className="form-control"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Sign Up
          </button>
          <div className="mb-3">
            Already have an Account{' '}
            <Link to={`/signin?redirect=${redirect}`}>Sign In</Link>
          </div>
        </form>
      </div>
    </>
  );
};

export default SignupScreen;
