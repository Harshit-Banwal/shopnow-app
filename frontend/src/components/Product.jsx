import React, { useEffect, useReducer } from 'react';
// import data from '../data';
import axios from 'axios';
import ProductItem from './ProductItem';
import Loading from '../components/Loading';
import Error from '../components/Error';
import { API } from '../backend.js';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, products: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

const Product = () => {
  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
    products: [],
    loading: true,
    error: '',
  });
  // const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get(`${API}/api/products`);
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
        // setProducts(result.data);
      } catch (error) {
        dispatch({ type: 'FETCH_FAIL', payload: error.message });
        console.log(error);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <div className="row">
        {loading ? (
          <Loading />
        ) : error ? (
          <Error color="danger">{error}</Error>
        ) : (
          products.map((product) => {
            return (
              <div key={product.slug} className="col-6 col-md-3">
                <ProductItem product={product} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Product;
