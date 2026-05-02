import React from 'react';

const ColorModeContext = React.createContext<{ toggleColorMode: () => void }>({ toggleColorMode: () => {} });

export default ColorModeContext;
