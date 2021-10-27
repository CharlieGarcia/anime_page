import React from 'react';
import { Link } from 'react-router-dom';
import _get from 'lodash/get';
import _reduce from 'lodash/reduce';
import AnimeList from '../components/AnimeList';
import Pagination from '../components/Pagination';
import SearchForm from '../components/search/SearchForm';
import { fetch } from '../helpers/request';
import {
  ANIME_SEASONS,
  ANIME_STATUS,
  ANIME_SORT,
  ANIME_SUBTYPE,
  ANIME_AGE_RATING,
  ITEMS_PER_PAGE
} from '../constants';

class Browse extends React.Component {
  constructor(props) {
    super(props);
    this.searchFields = {
      seasonYear: this.props.year || new Date().getFullYear(),
      sort: ANIME_SORT.popularityRank,
      status: ANIME_STATUS.any,
      season: ANIME_SEASONS.any,
      categories: '',
      subtype: ANIME_SUBTYPE.any,
      ageRating: ANIME_AGE_RATING.any
    };
    this.state = {
      animeList: [],
      searchFields: this.searchFields,
      genres: [],
      currentPage: 1,
      status: ''
    };
  }

  updateTextField = (evt) => {
    const elementName = evt.target ? evt.target.getAttribute('name') : null,
      elementValue = evt.target ? evt.target.value : null;

    if (elementName && elementValue !== null) {
      const newState = Object.assign({}, this.state.searchFields, {
        [elementName]: elementValue
      });

      this.setState(() => ({
        searchFields: newState
      }));
    }
  };

  updateSelectField = (evt) => {
    const element = evt.target || null,
      elementName = element ? element.getAttribute('name') : null,
      selectedOption = element
        ? element.options[element.selectedIndex].value
        : '',
      newState = Object.assign({}, this.state.searchFields, {
        [elementName]: selectedOption
      });

    this.setState(() => ({
      searchFields: newState
    }));
  };

  updateAnimeList = (currentPage) => {
    const offset = currentPage > 1 ? currentPage * ITEMS_PER_PAGE : currentPage;
    const searchParams =
      _reduce(
        this.state.searchFields,
        (result, value, key) => {
          if (value) {
            if (key !== 'sort') {
              result[`filter[${key}]`] = value;
            } else {
              result[`sort`] = value;
            }
          }

          return result;
        },
        {}
      ) || {};
    const options = {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      'page[offset]': offset,
      'page[limit]': ITEMS_PER_PAGE,
      ...searchParams
    };

    return fetch('/anime', options).then((resp) => {
      this.setState(() => ({
        animeList: _get(resp, 'data.data', []),
        count: _get(resp, 'data.meta.count', 0),
        currentPage,
        status: 'done'
      }));
    });
  };

  fetchAnimes = (evt) => {
    this.setState({ status: 'searching' });
    evt.preventDefault();
    this.updateAnimeList(1);
  };

  updateCurrentPage = (evt) => {
    this.updateAnimeList(parseInt(evt.target.outerText)).then(() => {
      window.scrollTo(0, 0);
    });
  };

  clearFilters = () => {
    this.setState({
      animeList: [],
      searchFields: this.searchFields,
      currentPage: 1,
      status: ''
    });
  };

  render() {
    return (
      <div>
        <Link to="/">Back to Home</Link>
        <SearchForm
          searchFields={this.state.searchFields}
          updateTextField={this.updateTextField}
          updateSelectField={this.updateSelectField}
          fetchAnimes={this.fetchAnimes}
          clearFilters={this.clearFilters}
        />
        {this.state.status === 'searching' ? 'Loading...' : null}
        {this.state.status === 'done' ? (
          <AnimeList list={this.state.animeList} />
        ) : null}
        {this.state.count ? (
          <Pagination
            total={this.state.count}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={this.state.currentPage}
            updateCurrentPage={this.updateCurrentPage}
          />
        ) : null}
      </div>
    );
  }
}

export default Browse;
