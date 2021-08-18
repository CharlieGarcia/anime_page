import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Card = styled.div`
  display: flex;
`;

const CardDetails = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  min-width: calc(100% - (284px + 20px));
`;

const ImageWrapper = styled.img.attrs((props) => ({
  src: props.imageUrl
}))`
  margin: 0 20px 0 0;
`;

const StyledLink = styled(Link).attrs((props) => ({
  to: props.to
}))`
  border-radius: 20px;
  box-shadow: 10px 10px 30px rgba(0, 0, 0, .4);
  color: #000;
  display: block;
  margin: 20px 0;
  text-decoration: none;
  overflow: hidden;
`;

function AnimeCard({ id, attributes }) {
  const { subtype = '', titles = {}, posterImage = {}, episodeCount = '', episodeLength = '' } = attributes;
  const { en: englishTitle = '', en_jp: enGlishJapaneseTitle = '', ja_jp: titleRomaji = '' } = titles;
  const { small: posterImageUrl } = posterImage;
  const titleEnglish = englishTitle || enGlishJapaneseTitle;


  return (
    <StyledLink to={`/details/${id}`}>
      <Card>
        <ImageWrapper imageUrl={posterImageUrl} />
        <CardDetails>
          <p>Japanese Title: {titleRomaji}</p>
          <p>English Title: {titleEnglish}</p>
          <p>Episodes: {episodeCount || "N/A"}</p>
          <p>SubType: {subtype}</p>
          <p>Episode Length in minutes: {episodeLength || "N/A"}</p>
        </CardDetails>
      </Card>
    </StyledLink>
  );
}

export default AnimeCard;
