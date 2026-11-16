import { PublicProfile } from '@/types';

export type ProfileMeta = {
  title: string;
  description: string;
  image: string | null;
};

// Link previews show roughly this much of the description
const DESCRIPTION_MAX = 200;

// Title, description and image for a public profile's <head> and link previews
export function profileMeta(profile: PublicProfile): ProfileMeta {
  const { displayName, username, bio, avatarUrl } = profile;
  const title = username ? `${displayName} (@${username})` : displayName;
  const text = bio.trim().replace(/\s+/g, ' ');
  const description = !text
    ? `${displayName}'s profile on My Anime.`
    : text.length > DESCRIPTION_MAX
      ? `${text.slice(0, DESCRIPTION_MAX - 1).trimEnd()}…`
      : text;

  return { title, description, image: avatarUrl };
}
