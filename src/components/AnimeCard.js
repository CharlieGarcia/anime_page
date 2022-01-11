import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Card = styled.div`
  display: flex;
`;

const CardDetails = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  min-width: calc(100% - (284px + 20px));
`;

const ImageWrapper = styled.div`
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

const Image = styled.img.attrs(props => ({
  src: props.imageUrl
}))`
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  width: 100%;
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
        <ImageWrapper>
          <Image imageUrl={posterImageUrl} />
        </ImageWrapper>
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
