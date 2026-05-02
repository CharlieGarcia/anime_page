import React from 'react';
import { Pagination } from '@mui/material';

type CustomPaginationProps = {
  total: number;
  itemsPerPage: number;
  currentPage?: number;
  updateCurrentPage: (event: React.ChangeEvent<unknown>, page: number) => void;
};

const CustomPagination = ({
  total,
  itemsPerPage,
  currentPage = 1,
  updateCurrentPage
}: CustomPaginationProps) => {
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
