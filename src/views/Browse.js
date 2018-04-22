import React from 'react';
import { NavLink } from 'react-router-dom';
import _omit from 'lodash/omit';
import AnimeList from '../components/AnimeList';
import hanldeAnimeRequest from '../helpers/request';

const ANIME_SEASONS = [
  "winter",
  "spring",
  "summer",
  "fall"
],
  ANIME_STATUS = [
    'finished airing',
    'currently airing',
    'not yet aired',
    'cancelled',
  ],
  ANIME_SORT = [
    'id',
    'score',
    'popularity',
    'start_date',
    'end_dat',
    'id-desc',
    'score-desc',
    'popularity-desc',
    'start_date-desc',
    'end_dat-desc'
  ];


function AnimeSelectOption({ list, handleChange, name }) {
  return (
    <select onChange={handleChange} name={name}>
      {list.map((item, index) =>
        <option value={item} key={index}>{item}</option>)}
    </select>
  );
}

class Browse extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      animeList: [],
      year: this.props.year || new Date().getFullYear(),
      genres: '',
      genres_exclude: '',
      airing_data: false,
      full_page: true,
      sort: 'popularity',
      status: 'currently airing',
      season: 'winter'
    };
  }

  updateTextField = (evt) => {
    const elementName = evt.target ? evt.target.getAttribute('name') : null,
      elementValue = evt.target ? evt.target.value : null;

    if (elementName && elementValue !== null) {
      this.setState(() => ({
        [elementName]: elementValue
      }));
    }
  }

  updateCheckField = (evt) => {
    const elementName = evt.target ? evt.target.getAttribute('name') : null,
      isChecked = !this.state[elementName];

    if (elementName) {
      this.setState(() => ({
        [elementName]: isChecked
      }));
    }
  }

  updateSelectField = (evt) => {
    const element = evt.target || null,
      elementName = element ? element.getAttribute('name') : null,
      selectedOption = element ? element.options[element.selectedIndex].value : '';

    this.setState(() => ({
      [elementName]: selectedOption
    }))
  }

  fetchAnimes = (evt) => {
    evt.preventDefault();
    hanldeAnimeRequest('/browse/anime', _omit(this.state, 'animeList'))
      .then(animeList => {
        this.setState(() => ({
          animeList
        }))
      });
  }

  render() {
    return (
      <div>
        <NavLink to="/">Back to Home</NavLink>
        <form onSubmit={this.fetchAnimes}>
          <label htmlFor="year">
            Anime Year
            <input id="year" name="year" type="text" value={this.state.year} onChange={this.updateTextField} />
          </label>
          <AnimeSelectOption list={ANIME_SEASONS} handleChange={this.updateSelectField} name="season" />
          <AnimeSelectOption list={ANIME_STATUS} handleChange={this.updateSelectField} name="status" />
          <fieldset>
            <label htmlFor="genres">
              Anime genres
              <input id="genres" name="genres" type="text" value={this.state.genres} onChange={this.updateTextField} />
            </label>
            <span>
              Please separate genres by comma
              <br />
              Note: Only brings animes that match all specified tags
            </span>
          </fieldset>
          <fieldset>
            <label htmlFor="genres_exclude">
              Genres to exclude
              <input id="genres_exclude" name="genres_exclude" type="text" value={this.state.genres_exclude} onChange={this.updateTextField} />
            </label>
            <span>
              Please separate genres to exclude by comma
              <br />
              Note: It will show animes that does not match any of the specified excluded genres
            </span>
          </fieldset>
          <AnimeSelectOption list={ANIME_SORT} handleChange={this.updateSelectField} name="sort" />
          <label htmlFor="airing_data">
            Airing data
            <input id="airing_data" type="checkbox" name="airing_data" onChange={this.updateCheckField} checked={this.state.airing_data} />
          </label>
          <label htmlFor="full_page">
            Full page
            <input id="full_page" type="checkbox" name="full_page" onChange={this.updateCheckField} checked={this.state.full_page} />
          </label>
          <button type="submit">Search</button>
        </form>
        <AnimeList list={this.state.animeList} />
      </div>
    );
  }
}

export default Browse;
