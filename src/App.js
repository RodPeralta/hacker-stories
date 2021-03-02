import React from 'react';
import axios from 'axios';

import SearchForm from './SearchForm';
import List from './List';
import LastSearches from './LastSearches';

import './App.css'

const API_BASE = 'https://hn.algolia.com/api/v1';
const API_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HITSPERPAGE = 'hitsPerPage=16'

const getUrl = (searchTerm, page) => `${API_BASE}${API_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HITSPERPAGE}`;

const extractSearchTerm = url => url.substring(url.lastIndexOf('?') + 1, url.indexOf('&')).replace(PARAM_SEARCH, '');

const getLastSearches = urls => urls.map(extractSearchTerm).reverse().slice(1);


const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
};

const storiesReducer = (state, action) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: 
          action.payload.page === 0
            ? action.payload.list
            : state.data.concat(action.payload.list),
        page: action.payload.page,
      };
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter(story => action.payload.objectID !== story.objectID),
      };
    default:
      throw new Error();
  }

};


const  App = () => {

  // State Variables
  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');
  const [urls, setUrls] = React.useState([getUrl(searchTerm,0)]);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    {data: [], page: 0, isLoading: false, isError: false}
  );


  // Handler Functions
  const handleSearchInput = event => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = event => {
    setIsLoadingMore(false);
    handleSearch(searchTerm, 0);

    event.preventDefault();
  };

  const handleLastSearch = searchTerm => {
    setSearchTerm(searchTerm);
    setIsLoadingMore(false);
    handleSearch(searchTerm, 0);
  };

  const handleSearch = (searchTerm, page) => {
    const newUrl = getUrl(searchTerm, page);
    setUrls(urls.filter(url => extractSearchTerm(url) !== extractSearchTerm(newUrl)).concat(newUrl).slice(-5));
  };

  const handleMore = () => {
    const lastUrl = urls[urls.length -1];
    const searchTerm = extractSearchTerm(lastUrl);
    setIsLoadingMore(true);
    handleSearch(searchTerm, stories.page + 1);
  };

  const handleFetchStories = React.useCallback(async () => {
    dispatchStories({type: 'STORIES_FETCH_INIT'});

    try {
      const lastUrl = urls[urls.length - 1];
      const result = await axios.get(lastUrl);

      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: {
          list: result.data.hits,
          page: result.data.page,
        }
      });
    } catch {
      dispatchStories({type: 'STORIES_FETCH_FAILURE'});
    }
  },[urls]);

  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);


  const handleRemoveStory = item => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item
    });
  };


  return (
    <div className="container">
      <h1 className="headline-primary">
        My Hacker Stories
      </h1>

      <SearchForm searchTerm={searchTerm} onSearchInput={handleSearchInput} onSearchSubmit={handleSearchSubmit}/>

      <LastSearches lastSearches={getLastSearches(urls)} onLastSearch={handleLastSearch} />

      <hr/>

      {stories.isError && <p>Something went wrong...</p>}

      {!stories.isLoading || isLoadingMore ? (
        <List list={stories.data} onRemoveItem={handleRemoveStory}/>
      ) : (
        <></>
      )}
      

      {stories.isLoading ? (
        <p>Loading...</p>
      ): (
        <button type="button" onClick={handleMore}>
          More
        </button>
      )}
      

      
    </div>
  );
};

export default App;
