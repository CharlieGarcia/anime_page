import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import CustomPagination from './pagination';

afterEach(cleanup);

// The numbered page buttons, e.g. [1, 2, 3]
function pageNumbers() {
  return screen
    .getAllByRole('button')
    .map((button) => Number(button.textContent))
    .filter((page) => !Number.isNaN(page) && page > 0);
}

function renderPagination(total: number, currentPage?: number) {
  const updateCurrentPage = vi.fn();
  render(
    <CustomPagination
      total={total}
      itemsPerPage={12}
      currentPage={currentPage}
      updateCurrentPage={updateCurrentPage}
    />
  );
  return updateCurrentPage;
}

describe('CustomPagination', () => {
  it.each([
    [1, 1],
    [12, 1],
    [13, 2],
    [24, 2],
    [25, 3]
  ])('shows %i results as %i page(s)', (total, pages) => {
    renderPagination(total);

    expect(Math.max(...pageNumbers())).toBe(pages);
  });

  it('hides the previous button on the first page', () => {
    renderPagination(36, 1);

    expect(screen.queryByLabelText('Go to previous page')).toBeNull();
    expect(screen.getByLabelText('Go to next page')).toBeTruthy();
  });

  it('hides the next button on the last page', () => {
    renderPagination(36, 3);

    expect(screen.getByLabelText('Go to previous page')).toBeTruthy();
    expect(screen.queryByLabelText('Go to next page')).toBeNull();
  });

  it('reports the page that was clicked', () => {
    const updateCurrentPage = renderPagination(36, 1);

    fireEvent.click(screen.getByLabelText('Go to page 2'));

    expect(updateCurrentPage).toHaveBeenCalledTimes(1);
    expect(updateCurrentPage.mock.calls[0][1]).toBe(2);
  });
});
