import React from 'react';
import { useSelector } from 'react-redux';
import { isLoading } from './allSelector';


const Loader = () => {


  const roleLoader = useSelector(isLoading)


  return (
    <>
      {roleLoader && (
        <div className='mainLoader'>
          <div className="lds-ripple">
            <div></div>
          </div>
        </div>
      )}
    </>
  );
}

export default Loader;
