import React from 'react';
import Product from '../components/Product';

const HomeScreen = () => {
  return (
    <>
      <div className="section-image">
        <div
          id="carouselExampleIndicators"
          className="carousel slide"
          data-bs-ride="carousel"
        >
          <div className="carousel-indicators">
            <button
              type="button"
              data-bs-target="#carouselExampleIndicators"
              data-bs-slide-to="0"
              className="active"
              aria-current="true"
              aria-label="Slide 1"
            ></button>
            <button
              type="button"
              data-bs-target="#carouselExampleIndicators"
              data-bs-slide-to="1"
              aria-label="Slide 2"
            ></button>
            <button
              type="button"
              data-bs-target="#carouselExampleIndicators"
              data-bs-slide-to="2"
              aria-label="Slide 3"
            ></button>
          </div>
          <div className="carousel-inner carousel-images">
            <div className="carousel-item active">
              <img src="/images/bg-0.jpg" className="w-100 h-100" alt="error" />
              <div className="carousel-caption">
                <h3>Grow your image with your clothes. Go Shopping.</h3>
                <p>Shop now</p>
              </div>
            </div>
            <div className="carousel-item">
              <img src="/images/bg-1.jpg" className="w-100 h-100" alt="error" />
              <div className="carousel-caption">
                <h3>It’s that time of the season, pay less, get more.</h3>
                <p>Shop now</p>
              </div>
            </div>
            <div className="carousel-item">
              <img src="/images/bg-2.jpg" className="w-100 h-100" alt="error" />
              <div className="carousel-caption">
                <h3>Spend some money, will ya?</h3>
                <p>Shop now</p>
              </div>
            </div>
          </div>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#carouselExampleIndicators"
            data-bs-slide="prev"
          >
            <span
              className="carousel-control-prev-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#carouselExampleIndicators"
            data-bs-slide="next"
          >
            <span
              className="carousel-control-next-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>

      <div className="container mt-4">
        <Product />
      </div>
    </>
  );
};

export default HomeScreen;
