import React from 'react';
import { Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';
import _startCase from 'lodash/startCase';

export type CustomSelectProps = {
  list: string[];
  handleChange: (event: SelectChangeEvent<string>) => void;
  name: string;
  value: string;
  fullWidth?: boolean;
};

function CustomSelect({ list, handleChange, name, value, fullWidth = false }: CustomSelectProps) {
  return (
    <FormControl fullWidth={fullWidth}>
      <InputLabel htmlFor={name}>{name}</InputLabel>
      <Select
        id={name}
        label={name}
        value={value}
        onChange={handleChange}>
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
