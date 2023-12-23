import axios from 'axios';
import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Store } from '../Store';
import Rating from './Rating';
import { API } from '../backend';
import { toast } from 'react-toastify';

const ProductItem = (props) => {
  const { product } = props;

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  const [outOfStock, setOutOfStock] = useState(false);

  const addToCartHandler = async (item) => {
    const existItem = cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`${API}/api/products/${item._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }
    if (quantity >= data.countInStock) {
      setOutOfStock(true);
    }
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...item, quantity },
    });
    toast.success('Item Added to Cart');
  };

  return (
    <>
      <div className="card mb-5">
        <div>
          <Link to={`/product/${product.slug}`}>
            <img
              src={product.image}
              className="card-img-top"
              alt={product.name}
            />
          </Link>
          <div className="card-body">
            <Link to={`/product/${product.slug}`}>
              <h5 className="card-title">{product.name}</h5>
            </Link>
            <Rating rating={product.rating} numReview={product.numReviews} />
            <p>
              <strong>₹{product.price}</strong>
            </p>
            {outOfStock ? (
              <button type="button" disabled className="btn btn-light">
                Out OF Stock
              </button>
            ) : (
              <button
                type="button"
                onClick={() => addToCartHandler(product)}
                className="btn btn-warning"
              >
                Add to cart
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductItem;
