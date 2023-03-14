import React from 'react';
import Link from 'next/link';

const Card = `
  display: flex;
`;

const CardDetails = `
  display: flex;
  justify-content: center;
  flex-direction: column;
  min-width: calc(100% - (284px + 20px));
`;

const ImageWrapper = `
  margin: 0 20px 0 0;
  position: relative;

  &:before {
    content: '';
    display: inline-block;
    height: calc(4/3 * 284px);
    position: relative;
    width: 225px;
  }
`;

const Image = `
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  width: 100%;
`;

const StyledLink = `
  border-radius: 20px;
  box-shadow: 10px 10px 30px rgba(0, 0, 0, .4);
  color: #000;
  display: block;
  margin: 20px 0;
  text-decoration: none;
  overflow: hidden;
`;

const AnimeCard = ({ id, attributes }) => {
  const {
    subtype = '',
    titles = {},
    posterImage = {},
    episodeCount = '',
    episodeLength = ''
  } = attributes;
  const {
    en: englishTitle = '',
    en_jp: enGlishJapaneseTitle = '',
    ja_jp: titleRomaji = ''
  } = titles;
  const { small: posterImageUrl } = posterImage;
  const titleEnglish = englishTitle || enGlishJapaneseTitle;

  return (
    <Link href={`/details/${id}`}>
      <div>
        <div>
          <img src={posterImageUrl} />
        </div>
        <div>
          <p>Japanese Title: {titleRomaji}</p>
          <p>English Title: {titleEnglish}</p>
          <p>Episodes: {episodeCount || 'N/A'}</p>
          <p>SubType: {subtype}</p>
          <p>Episode Length in minutes: {episodeLength || 'N/A'}</p>
        </div>
      </div>
    </Link>
  );
};

export default AnimeCard;
