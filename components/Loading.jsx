import React from 'react';
import { CircularProgress } from '@mui/material';

const LoadingSpinner = (props) => {
  return (
    <CircularProgress
      size={40}
      sx={{
        position: 'absolute',
        top: '50%',
        right: '50%',
        transform: 'translate(-50%, -50%)'
      }}
      {...props}
    />
  );
};

export default LoadingSpinner;
