import React from 'react';

const Error = (props) => {
  return (
    <>
      <div className={`alert alert-${props.color}`} role="alert">
        {props.children}
      </div>
    </>
  );
};

export default Error;
