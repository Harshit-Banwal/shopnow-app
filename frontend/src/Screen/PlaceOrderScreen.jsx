import React, { useContext, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Checkout from '../components/Checkout';
import { Store } from '../Store';
import { Link, useNavigate } from 'react-router-dom';
import { useReducer } from 'react';
import { getError } from '../error';
import { toast } from 'react-toastify';
import axios from 'axios';
import Loading from '../components/Loading';

const reducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_REQUEST':
      return { ...state, loading: true };

    case 'CREATE_SUCCESS':
      return { ...state, loading: false };

    case 'CREATE_FAIL':
      return { ...state, loading: false };

    default:
      return state;
  }
};

const PlaceOrderScreen = () => {
  const navigate = useNavigate();

  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false,
    error: '',
  });

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;
  cart.itemsPrice = round2(
    cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  );
  cart.shippingPrice = cart.itemsPrice > 100 ? round2(0) : round2(10);
  cart.taxPrice = round2(0.15 * cart.itemsPrice);
  cart.totalPrice = cart.itemsPrice + cart.shippingPrice + cart.taxPrice;

  const placeOrderHandler = async () => {
    try {
      dispatch({ type: 'CREATE_REQUEST' });

      const { data } = await axios.post(
        '/api/orders',
        {
          orderItems: cart.cartItems,
          shippingAddress: cart.shippingAddress,
          paymentMethod: cart.paymentMethod,
          itemsPrice: cart.itemsPrice,
          shippingPrice: cart.shippingPrice,
          taxPrice: cart.taxPrice,
          totalPrice: cart.totalPrice,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      ctxDispatch({ type: 'CART_CLEAR' });
      dispatch({ type: 'CREATE_SUCCESS' });
      localStorage.removeItem('cartItems');
      navigate(`/order/${data.order._id}`);
    } catch (error) {
      dispatch({ type: 'CREATE_FAIL' });
      toast.error(getError(error));
    }
  };

  useEffect(() => {
    if (!cart.paymentMethod) {
      navigate('/payment');
    }
  }, [cart, navigate]);

  return (
    <>
      <Helmet>
        <title>Preview Order</title>
      </Helmet>
      <Checkout step1 step2 step3 step4></Checkout>

      <div className="container">
        <h1 className="m-3 text-center">Preview Order</h1>
        <div>
          <div className="row">
            <div className="col-12 col-md-8">
              <div className="card mb-3">
                <div className="card-body">
                  <h5 className="card-title">Shipping</h5>
                  <p>
                    <strong>Name:</strong> {cart.shippingAddress.fullName}
                    <br />
                    <strong>Address:</strong> {cart.shippingAddress.address},
                    {cart.shippingAddress.city}, {cart.shippingAddress.pinCode},
                    {cart.shippingAddress.country}
                  </p>
                  <Link to="/shipping">Edit</Link>
                </div>
              </div>
              <div className="card mb-3">
                <div className="card-body">
                  <h5 className="card-title">Payment</h5>
                  <p>
                    <strong>Method:</strong> {cart.paymentMethod}
                  </p>
                  <Link to="/payment">Edit</Link>
                </div>
              </div>
              <div className="card mb-3">
                <div className="card-body">
                  <h5 className="card-title">Items</h5>
                  <ul className="list-group list-group-flush">
                    {cart.cartItems.map((item) => (
                      <li className="list-group-item" key={item.slug}>
                        <div className="row">
                          <div className="col-7 col-md-6">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="img-fluid rounded img-thumbnail"
                            />
                            <Link to={`/product/${item.slug}`}>
                              {item.name}
                            </Link>
                          </div>
                          <div className="col-2 col-md-3">
                            <span>{item.quantity}</span>
                          </div>
                          <div className="col-3 col-md-3">
                            <span>{item.price}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Link to="/payment">Edit</Link>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Order Summary</h5>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item">
                      <div className="row">
                        <div className="col-6">Items</div>
                        <div className="col-6">
                          &#8377;{cart.itemsPrice.toFixed(2)}
                        </div>
                      </div>
                    </li>
                    <li className="list-group-item">
                      <div className="row">
                        <div className="col-6">Shipping</div>
                        <div className="col-6">
                          &#8377;{cart.shippingPrice.toFixed(2)}
                        </div>
                      </div>
                    </li>
                    <li className="list-group-item">
                      <div className="row">
                        <div className="col-6">Tax</div>
                        <div className="col-6">
                          &#8377;{cart.taxPrice.toFixed(2)}
                        </div>
                      </div>
                    </li>
                    <li className="list-group-item">
                      <div className="row">
                        <div className="col-6">
                          <strong>Order Total</strong>
                        </div>
                        <div className="col-6">
                          <strong>&#8377;{cart.totalPrice.toFixed(2)}</strong>
                        </div>
                      </div>
                    </li>
                    <li className="list-group-item">
                      <div className="d-grid">
                        {loading ? (
                          <Loading></Loading>
                        ) : (
                          <button
                            className="btn btn-warning"
                            onClick={placeOrderHandler}
                            type="button"
                            disabled={cart.cartItems.length === 0}
                          >
                            Place Order
                          </button>
                        )}
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlaceOrderScreen;
