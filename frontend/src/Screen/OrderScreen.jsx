import React, { useContext, useEffect, useReducer, useState } from 'react';
import Loading from '../components/Loading';
import Error from '../components/Error';
import { Store } from '../Store';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { getError } from '../error';
// import razorPayLogo from '../../public/images/razorparLogo.png';
import { toast } from 'react-toastify';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };

    case 'FETCH_SUCCESS':
      return { ...state, loading: false, order: action.payload, error: '' };

    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };

    case 'PAY_REQ':
      return { ...state, loadingPay: true };

    case 'PAY_SUCCESS':
      return { ...state, loadingPay: false, successPay: true };

    case 'PAY_FAIL':
      return { ...state, loadingPay: false };

    case 'PAY_RESET':
      return { ...state, loadingPay: false, successPay: false };

    default:
      return state;
  }
}

function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

const OrderScreen = () => {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [razorPayKey, setRazorPayKey] = useState('');
  const [isPending, setIsPending] = useState(false);

  const params = useParams();
  const { id: orderId } = params;
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(window.location.search);
  const instamojo_id = searchParams.get('payment_id');
  const instamojo_status = searchParams.get('payment_status');

  const [{ loading, error, order, loadingPay, successPay }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
      order: {},
      loadingPay: false,
      successPay: false,
    });

  // console.log(order);

  async function placeOrderHandler() {
    try {
      dispatch({ type: 'PAY_REQ' });

      const res = await loadScript(
        'https://checkout.razorpay.com/v1/checkout.js'
      );

      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        return;
      }

      const result = await axios.post(
        '/api/payment/razororder',
        {
          amount: order.totalPrice,
          currency: 'INR',
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      console.log('result', result.data);
      const { amount, currency, id } = result.data.razorOrder;
      console.log(isPending, loadingPay);

      const options = {
        key: razorPayKey,
        amount: amount,
        currency: currency,
        name: userInfo.name,
        order_id: id,
        handler: async function (response) {
          const data = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            status: 'Credit',
            email: userInfo.email,
          };

          const json = JSON.stringify(data);

          let result1 = await axios.post(
            `/api/payment/${order._id}/razor_success`,
            json,
            { headers: { 'Content-Type': 'application/Json' } }
          );

          console.log(result1.data, 'on_Success_result');

          if (result1.status === 201) {
            setIsPending(true);
            dispatch({ type: 'PAY_SUCCESS' });
            toast.success('Order is paid');
            // window.location.reload();
          } else {
            setIsPending(false);
            dispatch({ type: 'PAY_FAIL' });
            toast.error(getError('Invalid Payment'));
          }
        },
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
        },
        notes: {
          address: 'no address',
        },
        theme: {
          color: '#61dafb',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      dispatch({ type: 'PAY_RESET' });
    } catch (error) {
      dispatch({ type: 'PAY_FAIL', payload: getError(error) });
      toast.error(getError(error));
    }
  }

  async function placeOrderHandler2() {
    try {
      dispatch({ type: 'PAY_REQ' });

      let currUrl = window.location.href;
      let productName = '';

      order.orderItem.forEach((element, index) => {
        const product = element.name;
        if (index === 0) {
          productName = product;
        } else {
          productName = productName.concat(', ', product);
        }
      });

      const options = {
        amount: order.totalPrice,
        purpose: productName,
        buyer_name: userInfo.name,
        email: userInfo.email,
        url: currUrl,
      };

      // const data = JSON.stringify(options);

      const result = await axios.post(
        '/api/payment/instamojo',
        { options },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      console.log('Instamojo_result', result.data.longurl);

      if (result.status === 201) {
        setIsPending(true);
        dispatch({ type: 'PAY_SUCCESS' });
        toast.success('Order is placed Please wait.');
        window.location.href = result.data.longurl;
      } else {
        dispatch({ type: 'PAY_FAIL' });
        toast.error(getError('Invalid Payment'));
      }
    } catch (error) {
      dispatch({ type: 'PAY_FAIL', payload: getError(error) });
      toast.error(getError(error));
    }
  }

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        console.log(data);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (error) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(error) });
      }
    };

    if (!userInfo) {
      return navigate('/login');
    }

    if (!order._id || successPay || (order._id && order._id !== orderId)) {
      fetchOrder();
      if (successPay) {
        dispatch({ type: 'PAY_RESET' });
      }
    } else {
      const getKeyId = async () => {
        const { data: data2 } = await axios.get(`/api/payment/razorid`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        console.log(data2, 'razorPaykey_data');
        setRazorPayKey(data2.keyId);
      };
      getKeyId();
    }
  }, [order, userInfo, navigate, orderId, setRazorPayKey, successPay]);

  useEffect(() => {
    const on_success = async () => {
      const options = {
        payment_id: instamojo_id,
        payment_status: instamojo_status,
        email: userInfo.email,
      };

      const json = JSON.stringify(options);

      const { data } = await axios.post(
        `/api/payment/${orderId}/instamojo_success`,
        json,
        { headers: { 'Content-Type': 'application/Json' } }
      );
      if (data) {
        window.location.reload();
      }
    };

    if (order.isPaid === false && instamojo_id) {
      on_success();
    }
  }, [order, orderId, instamojo_id, instamojo_status, userInfo]);

  return loading ? (
    <Loading></Loading>
  ) : error ? (
    <Error color="danger">{error}</Error>
  ) : (
    <div>
      <Helmet>
        <title>Order</title>
      </Helmet>
      <h1 className="my-3 text-center">Order {orderId}</h1>
      <div className="container">
        <div className="row">
          <div className="col-12 col-md-8">
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">Shipping</h5>
                <p>
                  <strong>Name:</strong> {order.shippingAddress.fullName}
                  <br />
                  <strong>Address:</strong> {order.shippingAddress.address},
                  {order.shippingAddress.city}, {order.shippingAddress.pinCode},
                  {order.shippingAddress.country}
                </p>
                {order.isDelivered ? (
                  <Error color="success">
                    Delivered at {order.deliveredAt}
                  </Error>
                ) : (
                  <Error color="danger">Not Delivered</Error>
                )}
              </div>
            </div>
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">Payment</h5>
                <p>
                  <strong>Method:</strong> {order.paymentMethod}
                </p>
                {order.isPaid ? (
                  <Error color="success">Paid at {order.paidAt}</Error>
                ) : (
                  <Error color="danger">Not Paid</Error>
                )}
              </div>
            </div>
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">Items</h5>
                <ul className="list-group list-group-flush">
                  {order.orderItem.map((item) => (
                    <li className="list-group-item" key={item.slug}>
                      <div className="row">
                        <div className="col-7 col-md-8">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="img-fluid rounded img-thumbnail"
                          />
                          <Link to={`/product/${item.slug}`}>{item.name}</Link>
                        </div>
                        <div className="col-2 col-md-2">
                          <span>{item.quantity}</span>
                        </div>
                        <div className="col-3 col-md-2">
                          <span>{item.price}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Order Summary</h5>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">
                    <div className="row">
                      <div className="col">Items</div>
                      <div className="col">
                        &#8377;{order.itemsPrice.toFixed(2)}
                      </div>
                    </div>
                  </li>
                  <li className="list-group-item">
                    <div className="row">
                      <div className="col">Shipping</div>
                      <div className="col">
                        &#8377;{order.shippingPrice.toFixed(2)}
                      </div>
                    </div>
                  </li>
                  <li className="list-group-item">
                    <div className="row">
                      <div className="col">Tax</div>
                      <div className="col">
                        &#8377;{order.taxPrice.toFixed(2)}
                      </div>
                    </div>
                  </li>
                  <li className="list-group-item">
                    <div className="row">
                      <div className="col">
                        <strong>Order Total</strong>
                      </div>
                      <div className="col">
                        <strong>&#8377;{order.totalPrice.toFixed(2)}</strong>
                      </div>
                    </div>
                  </li>
                  {!order.isPaid && (
                    <li className="list-group-item">
                      {loadingPay || isPending ? (
                        <Loading />
                      ) : order.paymentMethod === 'RazorPay' ? (
                        <button
                          onClick={placeOrderHandler}
                          className="btn btn-primary mt-2"
                        >
                          Pay Now
                        </button>
                      ) : (
                        <button
                          onClick={placeOrderHandler2}
                          className="btn btn-warning"
                        >
                          Pay Now
                        </button>
                      )}
                    </li>
                  )}
                  {/* {loadingPay && <Loading />} */}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderScreen;
