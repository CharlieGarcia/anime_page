import React from 'react';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import _startCase from 'lodash/startCase';

function CustomSelect({ list, handleChange, name, value, fullWidth = false }) {
  return (
    <FormControl fullWidth={fullWidth}>
      <InputLabel htmlFor={name}>{name}</InputLabel>
      <Select
        id={name}
        label={name}
        value={value}
        onChange={handleChange}
        onBlur={handleChange}>
        {list.map((item, index) => (
          <MenuItem value={item} key={index}>
            {_startCase(item)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default CustomSelect;
