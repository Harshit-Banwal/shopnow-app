import bcrypt from 'bcryptjs';

const data = {
  users: [
    {
      name: 'Harshit',
      email: 'hb@gmail.com',
      password: bcrypt.hashSync('123456'),
      isAdmin: true,
    },

    {
      name: 'user',
      email: 'user@gmail.com',
      password: bcrypt.hashSync('123456'),
      isAdmin: false,
    },
  ],

  products: [
    {
      // _id: '1',
      name: 'Nike Slim Shirt',
      slug: 'nike-slim-shirt',
      category: 'Shirts',
      image: '/images/p1.jpg',
      price: 499,
      countInStock: 10,
      brand: 'Nike',
      rating: 4.5,
      numReviews: 10,
      description: 'high quality product',
    },

    {
      // _id: '2',
      name: 'Adidas fit Shirt',
      slug: 'adidas-fit-shirt',
      category: 'Shirts',
      image: '/images/p2.jpg',
      price: 499,
      countInStock: 10,
      brand: 'Adidas',
      rating: 4.0,
      numReviews: 10,
      description: 'high quality product',
    },

    {
      // _id: '3',
      name: 'Nike Slim Pant',
      slug: 'nike-slim-pant',
      category: 'Pants',
      image: '/images/p4.jpg',
      price: 699,
      countInStock: 15,
      brand: 'Nike',
      rating: 4.5,
      numReviews: 14,
      description: 'high quality product',
    },

    {
      // _id: '4',
      name: 'Adidas fit Pant',
      slug: 'adidas-fit-pant',
      category: 'Pants',
      image: '/images/p5.jpg',
      price: 650,
      countInStock: 14,
      brand: 'Adidas',
      rating: 4.5,
      numReviews: 10,
      description: 'high quality product',
    },
  ],
};

export default data;
