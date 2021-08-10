import React from 'react';
import { Link } from 'react-router-dom';

function AnimeCard({ id, attributes }) {
  const { subtype = '', titles = {}, posterImage = {}, episodeCount = '', episodeLength = '' } = attributes;
  const { en: englishTitle = '', en_jp: enGlishJapaneseTitle = '', ja_jp: titleRomaji = '' } = titles;
  const { medium: posterMediumUrl } = posterImage;
  const titleEnglish = englishTitle || enGlishJapaneseTitle;

  return (
    <Link to={`/details/${id}`}>
      <img src={posterMediumUrl} alt={titleEnglish} />
      <p>Japanese Title: {titleRomaji}</p>
      <p>English Title: {titleEnglish}</p>
      <p>Episodes: {episodeCount}</p>
      <p>SubType: {subtype}</p>
      <p>Episode Length in minutes: {episodeLength || "N/A"}</p>
    </Link>
  );
}

export default AnimeCard;
