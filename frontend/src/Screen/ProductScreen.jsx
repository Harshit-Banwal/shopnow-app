import axios from 'axios';
import React, { useEffect, useReducer } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Rating from '../components/Rating';
import { Helmet } from 'react-helmet-async';
import Loading from '../components/Loading';
import Error from '../components/Error';
import { getError } from '../error';
import { useContext } from 'react';
import { Store } from '../Store';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, product: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

const ProductScreen = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { slug } = params;

  const [{ loading, error, product }, dispatch] = useReducer(reducer, {
    product: [],
    loading: true,
    error: '',
  });
  // const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get(`/api/products/slug/${slug}`);
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
        // setProducts(result.data);
      } catch (error) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(error) });
        // console.log(error);
      }
    };
    fetchData();
  }, [slug]);

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart } = state;
  const addToCartHandler = async () => {
    const existItem = cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...product, quantity },
    });
    navigate('/cart');
  };

  return (
    <>
      {console.log(product)}
      {loading ? (
        <Loading />
      ) : error ? (
        <Error color="danger">{error}</Error>
      ) : (
        <div className="container mt-5">
          <div className="row">
            <div className="col-6">
              <img
                className="img-large"
                src={product.image}
                alt={product.name}
              />
            </div>
            <div className="col-3">
              <div className="card">
                <Helmet>
                  <title>{product.name}</title>
                </Helmet>
                <div className="card-body">
                  <h5 className="card-title">{product.name}</h5>
                </div>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">
                    <Rating
                      rating={product.rating}
                      numReview={product.numReviews}
                    />
                  </li>
                  <li className="list-group-item">Price: ₹ {product.price}</li>
                  <li className="list-group-item">
                    Description:
                    <p>{product.description}</p>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Price: ₹ {product.price}</h5>
                </div>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">
                    <span> Status: </span>
                    {product.countInStock > 0 ? (
                      <span className="badge bg-success"> In stoke</span>
                    ) : (
                      <span className="badge bg-danger">Out of stoke</span>
                    )}
                  </li>
                  {product.countInStock > 0 && (
                    <li className="list-group-item">
                      <div>
                        <button
                          onClick={addToCartHandler}
                          className="btn btn-warning"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductScreen;
