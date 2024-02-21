import React from 'react';
import { Pagination } from '@mui/material';

const CustomPagination = ({
  total,
  itemsPerPage,
  currentPage = 1,
  updateCurrentPage
}) => {
  const pageCount = Math.floor(total / itemsPerPage);

  return (
    <Pagination
      count={pageCount}
      color="primary"
      hidePrevButton={currentPage === 1}
      hideNextButton={currentPage === pageCount}
      page={currentPage}
      onChange={updateCurrentPage}
    />
  );
};

export default CustomPagination;
