import React from 'react';
import { FormControl, TextField } from '@mui/material';

export type CustomTextFieldProps = {
  name: string;
  label?: string;
  id: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  fullWidth?: boolean;
};

const CustomTextField = ({ name, label, id, value, onChange, fullWidth = false }: CustomTextFieldProps) => (
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
