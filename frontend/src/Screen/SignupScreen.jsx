import React, { useContext, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import { useEffect } from 'react';
import { getError } from '../error';
import { toast } from 'react-toastify';
import Loading from '../components/Loading';
import { API } from '../backend';
import Error from '../components/Error';

function reducer(state, action) {
  switch (action.type) {
    case 'OTP_REQ':
      return { ...state, loading: true };

    case 'OTP_SUCCESS':
      return {
        ...state,
        loading: false,
        otp: action.payload,
        modalBody: true,
        error: '',
      };

    case 'OTP_FAIL':
      return {
        ...state,
        loading: false,
        otp: {},
        modalBody: false,
        error: action.payload,
      };

    default:
      return state;
  }
}

const SignupScreen = () => {
  const navigate = useNavigate();

  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userOtp, setUserOtp] = useState(null);

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;

  const [{ loading, otp, modalBody, error }, dispatch] = useReducer(reducer, {
    loading: false,
    otp: {},
    modalBody: false,
    error: '',
  });

  // -----------------------------------Send OTP to user
  const otpHandler = async () => {
    try {
      dispatch({ type: 'OTP_REQ' });
      const { data } = await axios.post(`${API}/api/users/getOtp`, {
        email,
      });
      console.log(data);
      dispatch({ type: 'OTP_SUCCESS', payload: data });
      console.log(otp);
    } catch (err) {
      dispatch({ type: 'OTP_FAIL', payload: err.message });
      toast.error(getError(err));
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!email || !name || !password || !confirmPassword) {
      dispatch({
        type: 'OTP_FAIL',
        payload: !email
          ? 'Email field missing'
          : !name
          ? 'Name field missing'
          : !password
          ? 'Password is missing'
          : 'Confirm Password is missing',
      });
      toast.error('Please fill all the details');
      return;
    }

    if (password !== confirmPassword) {
      dispatch({
        type: 'OTP_FAIL',
        payload: 'Password does not match with Confirm password',
      });
      toast.error('Passwords does not match');
      return;
    }
    await otpHandler();
  };

  const verifyHandler = async (e) => {
    e.preventDefault();

    try {
      // console.log('userOTP: ', userOtp, 'OTP: ', otp.otp);

      if (otp.otp !== userOtp) {
        toast.error('OTP does not match');
        return;
      }

      const { data } = await axios.post(`${API}/api/users/signup`, {
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

      <div className="container form-width" id="sign-up">
        <form action="" className="account-form">
          <h2>Sign up</h2>
          <div className="input-field">
            <i className="fas fa-user"></i>
            <input
              onChange={(e) => setName(e.target.value)}
              type="name"
              required
              placeholder="Username"
            />
          </div>
          <div className="input-field">
            <i className="fas fa-envelope"></i>
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="Email"
            />
          </div>
          <div className="input-field">
            <i className="fas fa-lock"></i>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              placeholder="Password"
            />
          </div>
          <div className="input-field">
            <i className="fas fa-lock"></i>
            <input
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              required
              placeholder="Confirm Password"
            />
          </div>
          <button
            type="button"
            className="form-btn"
            data-bs-toggle="modal"
            data-bs-target="#staticBackdrop"
            onClick={submitHandler}
          >
            Sign Up
          </button>
          <div className="mt-3 mb-3">
            Already have an Account?{' '}
            <Link to={`/signin?redirect=${redirect}`}>Sign In</Link>
          </div>
        </form>
      </div>

      {/* Modal Content */}
      <div
        className="modal fade"
        id="staticBackdrop"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                Verify Your Email Address.
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            {loading ? (
              <div className="modal-body">
                <Loading />
              </div>
            ) : error !== '' ? (
              <div className="modal-body">
                <h2 className="mb-2">Something went wrong</h2>
                <Error color="danger">{error}</Error>
              </div>
            ) : (
              <div className="modal-body">
                <div className="mb-2">
                  <p>
                    Check OTP in your email{' '}
                    <span className="fst-italic text-decoration-underline text-primary">
                      {email}
                    </span>
                  </p>
                  <p>
                    If you don't see it in your inbox, please check your spam or
                    junk folder.
                  </p>
                </div>
                <form>
                  <div className="mb-3">
                    <label htmlFor="otp" className="col-form-label">
                      Enter OTP
                    </label>
                    <input
                      type="number"
                      onChange={(e) => setUserOtp(parseInt(e.target.value))}
                      id="otp"
                    />
                  </div>
                </form>
              </div>
            )}
            <div className="modal-footer">
              <button
                type="button"
                onClick={otpHandler}
                disabled={!modalBody}
                className="btn btn-primary"
              >
                Resend
              </button>
              <button
                type="button"
                onClick={verifyHandler}
                disabled={!modalBody || otp.otp !== userOtp}
                className="btn btn-primary"
                data-bs-dismiss="modal"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupScreen;
