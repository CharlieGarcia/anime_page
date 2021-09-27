import clsx from 'clsx';

const Pagination = ({ total, itemsPerPage, currentPage = 1, updateCurrentPage }) => {
  const pageCount = Math.floor(total / itemsPerPage);
  const pageList = Array.from(Array(pageCount).keys());

  return (
    <div>
      {pageList.map(i => {
        if (i <= 10 || i === (pageList.length - 1)) {
          const naturalNumber = i + 1;

          return (<button key={naturalNumber} className={clsx({ active: currentPage === naturalNumber })} value={naturalNumber} onClick={updateCurrentPage}>{naturalNumber}</button>);
        } else {
          return null;
        }
      })}
    </div>
  );
};

export default Pagination;
