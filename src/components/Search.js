import React from 'react';
import { Link } from 'react-router-dom';
import _get from 'lodash/get';
import _reduce from 'lodash/reduce';
import AnimeList from './AnimeList';
import Pagination from './Pagination';
import requestAnimeList from '../helpers/request';

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
      searchFields: {
        seasonYear: this.props.year || new Date().getFullYear(),
        sort: ANIME_SORT.popularityRank,
        status: ANIME_STATUS.current,
        season: ANIME_SEASONS.spring
      },
      currentPage: 1
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


    return requestAnimeList('/anime', options)
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
            <input id="year" name="seasonYear" type="text" value={this.state.seasonYear} onChange={this.updateTextField} />
          </label>
          <AnimeSelectOption list={Object.values(ANIME_SEASONS)} handleChange={this.updateSelectField} name="season" />
          <AnimeSelectOption list={Object.values(ANIME_STATUS)} handleChange={this.updateSelectField} name="status" />
          {/* <fieldset>
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
          </fieldset> */}
          <AnimeSelectOption list={Object.values(ANIME_SORT)} handleChange={this.updateSelectField} name="sort" />
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
