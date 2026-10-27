import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import ShareProfileButton from './ShareProfileButton';

const profileUrl = `${window.location.origin}/users/spike`;

const shareMock = vi.fn();
const writeTextMock = vi.fn();

// jsdom has neither a share sheet nor a clipboard; each test adds what it needs
function stubNavigator({ share }: { share: boolean }) {
  vi.stubGlobal('navigator', {
    ...navigator,
    share: share ? shareMock : undefined,
    clipboard: { writeText: writeTextMock }
  });
}

function renderButton() {
  render(<ShareProfileButton username="spike" displayName="Spike Spiegel" />);
}

const clickShare = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Share profile' }));

afterEach(() => {
  cleanup();
  shareMock.mockReset();
  writeTextMock.mockReset();
  vi.unstubAllGlobals();
});

describe('ShareProfileButton', () => {
  it('opens the share sheet with the public profile link', async () => {
    stubNavigator({ share: true });
    shareMock.mockResolvedValue(undefined);
    renderButton();

    clickShare();

    await vi.waitFor(() =>
      expect(shareMock).toHaveBeenCalledWith({
        title: 'Spike Spiegel',
        url: profileUrl
      })
    );
    expect(writeTextMock).not.toHaveBeenCalled();
    expect(screen.getByRole('status').textContent).toBe('');
  });

  it('does nothing more when the share sheet is closed', async () => {
    stubNavigator({ share: true });
    shareMock.mockRejectedValue(new DOMException('Closed', 'AbortError'));
    renderButton();

    clickShare();

    await vi.waitFor(() => expect(shareMock).toHaveBeenCalled());
    expect(writeTextMock).not.toHaveBeenCalled();
    expect(screen.getByRole('status').textContent).toBe('');
  });

  it('copies the link when sharing fails', async () => {
    stubNavigator({ share: true });
    shareMock.mockRejectedValue(new DOMException('Denied', 'NotAllowedError'));
    writeTextMock.mockResolvedValue(undefined);
    renderButton();

    clickShare();

    expect(await screen.findByText('Link copied')).toBeTruthy();
    expect(writeTextMock).toHaveBeenCalledWith(profileUrl);
  });

  it('copies the link when there is no share sheet', async () => {
    stubNavigator({ share: false });
    writeTextMock.mockResolvedValue(undefined);
    renderButton();

    clickShare();

    expect(await screen.findByText('Link copied')).toBeTruthy();
    expect(writeTextMock).toHaveBeenCalledWith(profileUrl);
  });

  it('shows the link when it cannot be copied', async () => {
    stubNavigator({ share: false });
    writeTextMock.mockRejectedValue(new Error('Blocked'));
    renderButton();

    clickShare();

    expect(
      await screen.findByText(
        `Could not copy the link. The address is ${profileUrl}`
      )
    ).toBeTruthy();
  });
});
