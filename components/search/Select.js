import React from 'react';
import _startCase from 'lodash/startCase';

function Select({ list, handleChange, name, value }) {
  return (
    <label htmlFor={name}>
      {_startCase(name)}
      <select
        id={name}
        value={value}
        onChange={handleChange}
        onBlur={handleChange}
        name={name}>
        {list.map((item, index) => (
          <option value={item} key={index}>
            {_startCase(item)}
          </option>
        ))}
      </select>
    </label>
  );
}

export default Select;
