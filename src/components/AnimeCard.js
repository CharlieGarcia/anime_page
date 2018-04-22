import React from 'react';

function AnimeCard({ title_english, title_romaji, image_url_lge, total_episodes, duration }) {
  return (
    <div>
      <img src={image_url_lge} alt={title_english} />
      <p>{title_romaji}</p>
      <p>Episodes: {total_episodes}</p>
      <p>Duration per episode: {duration}</p>
    </div>
  );
}

export default AnimeCard;
