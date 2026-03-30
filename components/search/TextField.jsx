import React from 'react';
import { FormControl, TextField } from '@mui/material';

const CustomTextField = ({ name, label, id, value, onChange, fullWidth = false }) => (
  <FormControl fullWidth={fullWidth}>
    <TextField
      label={label || name}
      variant="outlined"
      id={id}
      name={name}
      type="text"
      value={value}
      onChange={onChange}
    />
  </FormControl>
);

export default CustomTextField;
