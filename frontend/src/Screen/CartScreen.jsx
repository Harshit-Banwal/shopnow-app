import React, { useContext } from 'react';
import { Store } from '../Store';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../backend';

const CartScreen = () => {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  const updateCartHandler = async (item, quantity) => {
    const { data } = await axios.get(`${API}/api/products/${item._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...item, quantity },
    });
  };

  const removeItemHandler = (item) => {
    ctxDispatch({ type: 'CART_REMOVE_ITEM', payload: item });
  };

  const checkOutHandler = () => {
    navigate('/signin?redirect=/shipping');
  };

  return (
    <>
      <Helmet>
        <title>Shoping Cart</title>
      </Helmet>
      <div className="container">
        <h1>Shoping Cart</h1>

        <div>
          <div className="row">
            <div className="mb-3 col-12 col-md-8">
              {cartItems.length === 0 ? (
                <div className="alert alert-danger" role="alert">
                  <h4 className="alert-heading">Cart is Empty</h4>
                  <hr />
                  <p className="mb-0">
                    <Link to="/">Go Shopping</Link>
                  </p>
                </div>
              ) : (
                <div>
                  <ul className="list-group">
                    {cartItems.map((item) => {
                      return (
                        <li key={item._id} className="list-group-item">
                          <div className="row">
                            <div className="w-full col-5 col-md-4">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="img-fluid rounded img-thumbnail"
                              />{' '}
                              <Link to={`/product/${item.slug}`}>
                                {item.name}
                              </Link>
                            </div>
                            <div className="w-full col-3 col-md-3">
                              <button
                                className="btn"
                                onClick={() =>
                                  updateCartHandler(item, item.quantity - 1)
                                }
                                disabled={item.quantity === 1}
                              >
                                <i className="fa-solid fa-minus"></i>
                              </button>{' '}
                              <span>{item.quantity}</span>{' '}
                              <button
                                className="btn"
                                onClick={() =>
                                  updateCartHandler(item, item.quantity + 1)
                                }
                                disabled={item.quantity === item.countInStock}
                              >
                                <i className="fa-solid fa-plus"></i>
                              </button>
                            </div>
                            <div className="w-full col-2 col-md-3">
                              ₹{item.price}
                            </div>
                            <div className="w-full col-2 col-md-2">
                              <button
                                className="btn"
                                onClick={() => removeItemHandler(item)}
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
            <div className="col-12 col-md-4">
              <ul className=" list-group">
                <li className="list-group-item">
                  <h3>
                    Subtotal ({cartItems.reduce((a, c) => a + c.quantity, 0)}{' '}
                    items) : ₹{' '}
                    {cartItems.reduce((a, c) => a + c.price * c.quantity, 0)}
                  </h3>
                </li>
                <li className="list-group-item">
                  <button
                    className="btn btn-warning"
                    onClick={checkOutHandler}
                    type="button"
                    disabled={cartItems.length === 0}
                  >
                    Proceed to Checkout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartScreen;
