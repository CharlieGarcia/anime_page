import React from 'react';
import { Link } from 'react-router-dom';
import _get from 'lodash/get';
import _reduce from 'lodash/reduce';
import _startCase from 'lodash/startCase';
import AnimeList from './AnimeList';
import Pagination from './Pagination';
import { fetch, formatGenres } from '../helpers/request';

const ANIME_SEASONS = {
  winter: 'winter',
  spring: 'spring',
  summer: 'summer',
  fall: 'fall'
};
const ANIME_STATUS = {
  current: 'current',
  finished: 'finished',
  tba: 'tba',
  unreleased: 'unreleased',
  upcoming: 'upcoming'
};
const ANIME_SORT = {
  id: 'id',
  score: 'score',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  popularityRank: 'popularityRank',
  ratingRank: 'ratingRank',
  averageRating: 'averageRating',
  startDate: 'startDate',
  endDate: 'endDate'
};
const ANIME_SUBTYPE = {
  ona: 'ONA',
  ova: 'OVA',
  tv: 'TV',
  movie: 'movie',
  music: 'music',
  special: 'special'
};
const ANIME_AGE_RATING = {
  g: 'G',
  pg: 'PG',
  r: 'R'
};
const ITEMS_PER_PAGE = 10;


function AnimeSelectOption({ list, handleChange, name, value }) {
  return (
    <select value={value} onChange={handleChange} onBlur={handleChange} name={name}>
      {list.map((item, index) =>
        <option value={item} key={index}>{_startCase(item)}</option>)}
    </select>
  );
}

class Browse extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      animeList: [],
      searchFields: {
        seasonYear: this.props.year || new Date().getFullYear(),
        sort: ANIME_SORT.popularityRank,
        status: ANIME_STATUS.current,
        season: ANIME_SEASONS.spring,
        categories: '',
        subtype: '',
        ageRating: ANIME_AGE_RATING.g
      },
      genres: [],
      currentPage: 1,
      status: ''
    };
  }

  updateTextField = (evt) => {
    const elementName = evt.target ? evt.target.getAttribute('name') : null,
      elementValue = evt.target ? evt.target.value : null;

    if (elementName && elementValue !== null) {
      const newState = Object.assign({}, this.state.searchFields, { [elementName]: elementValue });

      this.setState(() => ({
        searchFields: newState
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
      selectedOption = element ? element.options[element.selectedIndex].value : '',
      newState = Object.assign({}, this.state.searchFields, { [elementName]: selectedOption });

    this.setState(() => ({
      searchFields: newState
    }))
  }

  componentDidMount() {
    fetch('/genres')
      .then(({ data }) => data.data)
      .then(genres => formatGenres(genres))
      .then(genres => {
        this.setState(() => ({
          genres
        }));
      });
  }

  updateAnimeList = (currentPage) => {
    const offset = currentPage > 1 ? currentPage * ITEMS_PER_PAGE : currentPage;
    const searchParams = _reduce(this.state.searchFields, (result, value, key) => {
      if (value) {
        if (key !== 'sort') {
          result[`filter[${key}]`] = value;
        } else {
          result[`sort`] = value;
        }
      }

      return result;
    }, {}) || {};
    const options = { 'page[offset]': offset, 'page[limit]': ITEMS_PER_PAGE, ...searchParams };


    return fetch('/anime', options)
      .then((resp) => {
        this.setState(() => ({
          animeList: _get(resp, 'data.data', []),
          count: _get(resp, 'data.meta.count', 0),
          currentPage,
          status: 'done'
        }))
      });
  }

  fetchAnimes = (evt) => {
    this.setState({ status: 'searching' });
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
            <input id="year" name="seasonYear" type="text" value={this.state.searchFields.seasonYear} onChange={this.updateTextField} />
          </label>
          <AnimeSelectOption value={this.state.searchFields.season} list={Object.values(ANIME_SEASONS)} handleChange={this.updateSelectField} name="season" />
          <AnimeSelectOption value={this.state.searchFields.status} list={Object.values(ANIME_STATUS)} handleChange={this.updateSelectField} name="status" />
          <AnimeSelectOption value={this.state.searchFields.categories} list={this.state.genres} handleChange={this.updateSelectField} name="categories" />
          <AnimeSelectOption value={this.state.searchFields.sort} list={Object.values(ANIME_SORT)} handleChange={this.updateSelectField} name="sort" />
          <AnimeSelectOption value={this.state.searchFields.subtype} list={Object.values(ANIME_SUBTYPE)} handleChange={this.updateSelectField} name="subtype" />
          <AnimeSelectOption value={this.state.searchFields.ageRating} list={Object.values(ANIME_AGE_RATING)} handleChange={this.updateSelectField} name="ageRating" />
          <button type="submit">Search</button>
        </form>
        {this.state.status === 'searching' ? 'Loading...' : null}
        {this.state.status === 'done' && (this.state.animeList || []).length
          ? <AnimeList list={this.state.animeList} />
          : null
        }
        {this.state.status === 'done' && !(this.state.animeList || []).length
          ? 'Content not found. Please try with other parameters'
          : null
        }
        {this.state.count
          ? <Pagination total={this.state.count} itemsPerPage={ITEMS_PER_PAGE} currentPage={this.state.currentPage} updateCurrentPage={this.updateCurrentPage} />
          : null}
      </div>
    );
  }
}

export default Browse;
