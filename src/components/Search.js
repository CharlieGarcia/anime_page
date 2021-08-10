import React from 'react';
import { Link } from 'react-router-dom';
import _get from 'lodash/get';
import AnimeList from './AnimeList';
import Pagination from './Pagination';
import requestAnimeList from '../helpers/request';

const ANIME_SEASONS = [
  "winter",
  "spring",
  "summer",
  "fall"
];
const ANIME_STATUS = [
  'finished airing',
  'currently airing',
  'not yet aired',
  'cancelled',
];
const ANIME_SORT = [
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
const ITEMS_PER_PAGE = 10;


function AnimeSelectOption({ list, handleChange, name }) {
  return (
    <select onChange={handleChange} onBlur={handleChange} name={name}>
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
      season: 'winter',
      currentPage: 1
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

  updateAnimeList = (currentPage) => {
    const offset = currentPage > 1 ? currentPage * ITEMS_PER_PAGE : currentPage;

    return requestAnimeList('/anime', { 'page[offset]': offset, 'page[limit]': ITEMS_PER_PAGE })
      .then((resp) => {
        this.setState(() => ({
          animeList: _get(resp, 'data.data', []),
          count: _get(resp, 'data.meta.count', 0),
          currentPage
        }))
      });
  }

  fetchAnimes = (evt) => {
    evt.preventDefault();
    this.updateAnimeList(1);
  }

  updateCurrentPage = (evt) => {
    this.updateAnimeList(parseInt(evt.target.outerText)).then(() => {
      window.scrollTo(0, 0);
    });
  }

  render() {
    return (
      <div>
        <Link to="/">Back to Home</Link>
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
        {this.state.count
          ? <Pagination total={this.state.count} itemsPerPage={ITEMS_PER_PAGE} currentPage={this.state.currentPage} updateCurrentPage={this.updateCurrentPage} />
          : null}
      </div>
    );
  }
}

export default Browse;
