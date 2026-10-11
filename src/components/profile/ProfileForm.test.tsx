import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProfileForm from './ProfileForm';
import { ApiError, meQuery } from '@/helpers/apiQueries';
import { Profile } from '@/types';

const profile: Profile = {
  id: 'user_1',
  username: null,
  displayName: 'Spike Spiegel',
  avatarUrl: null,
  bio: '',
  createdAt: '2026-10-11T00:00:00.000Z'
};

const fetchMock = vi.fn();

function respond(status: number, body: unknown) {
  fetchMock.mockResolvedValue(new Response(JSON.stringify(body), { status }));
}

function renderForm() {
  vi.stubGlobal('fetch', fetchMock);
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <ProfileForm profile={profile} />
    </QueryClientProvider>
  );
  return queryClient;
}

const field = (label: RegExp) => screen.getByLabelText(label);
const type = (label: RegExp, value: string) =>
  fireEvent.change(field(label), { target: { value } });
const save = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Save profile' }));
// The JSON body of the only request the form sent
const sentBody = () => JSON.parse(fetchMock.mock.calls[0][1].body);

afterEach(() => {
  cleanup();
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe('ProfileForm', () => {
  it('starts from the saved profile', () => {
    renderForm();

    expect(field(/Display name/)).toHaveProperty('value', 'Spike Spiegel');
    expect(field(/Username/)).toHaveProperty('value', '');
    expect(field(/Bio/)).toHaveProperty('value', '');
  });

  it('sends the edited fields and shows the saved profile', async () => {
    const queryClient = renderForm();
    respond(200, { ...profile, username: 'spike', bio: 'Bounty hunter' });

    type(/Username/, 'Spike');
    type(/Bio/, 'Bounty hunter');
    save();

    await screen.findByText('Profile saved');
    expect(fetchMock.mock.calls[0][0]).toBe('/api/me');
    expect(fetchMock.mock.calls[0][1].method).toBe('PATCH');
    expect(sentBody()).toEqual({
      displayName: 'Spike Spiegel',
      username: 'Spike',
      bio: 'Bounty hunter'
    });
    // Shows what the server stored, and updates the cached profile
    expect(field(/Username/)).toHaveProperty('value', 'spike');
    expect(queryClient.getQueryData(meQuery().queryKey)).toMatchObject({
      username: 'spike'
    });
  });

  it('leaves the username out while it is empty', async () => {
    renderForm();
    respond(200, { ...profile, bio: 'hi' });

    type(/Bio/, 'hi');
    save();

    await screen.findByText('Profile saved');
    expect(sentBody()).toEqual({ displayName: 'Spike Spiegel', bio: 'hi' });
  });

  it('shows a rejected field under that field and keeps what was typed', async () => {
    renderForm();
    respond(409, {
      error: 'That username is taken',
      fieldErrors: { username: 'That username is taken' }
    });

    type(/Username/, 'faye');
    save();

    await screen.findByText('That username is taken');
    expect(field(/Username/)).toHaveProperty('value', 'faye');
    expect(field(/Username/).getAttribute('aria-invalid')).toBe('true');
    expect(screen.queryByText('Profile saved')).toBeNull();
  });

  it('clears the error when the user edits again', async () => {
    renderForm();
    respond(409, {
      error: 'That username is taken',
      fieldErrors: { username: 'That username is taken' }
    });
    type(/Username/, 'faye');
    save();
    await screen.findByText('That username is taken');

    type(/Username/, 'faye2');

    await waitFor(() =>
      expect(screen.queryByText('That username is taken')).toBeNull()
    );
  });

  it('shows an error that belongs to no field', async () => {
    renderForm();
    respond(500, { error: 'Something went wrong' });

    type(/Bio/, 'hi');
    save();

    expect(await screen.findByText('Something went wrong')).toBeTruthy();
  });
});

describe('ApiError', () => {
  it('defaults to no field errors', () => {
    expect(new ApiError(500, 'x').fieldErrors).toEqual({});
  });
});
