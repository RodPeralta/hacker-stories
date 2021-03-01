import React from 'react';
import axios from 'axios';
import {sortBy} from 'lodash';

import './App.css'
import {ReactComponent as Check} from './check.svg';
import {ReactComponent as DownArrow} from './downArrow.svg';
import {ReactComponent as UpArrow} from './upArrow.svg';

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

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
        data: action.payload,
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

const getUrl = searchTerm => `${API_ENDPOINT}${searchTerm}`;

const extractSearchTerm = url => url.replace(API_ENDPOINT, '');

const getLastSearches = urls => urls.map(extractSearchTerm).reverse().slice(1);


//[...new Set(].slice(-6,-1).reverse();





const  App = () => {
  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');

  const [urls, setUrls] = React.useState([getUrl(searchTerm)]);

  const handleSearchInput = event => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = event => {
    handleSearch(searchTerm);

    event.preventDefault();
  };

  const handleLastSearch = searchTerm => {
    setSearchTerm(searchTerm);
    handleSearch(searchTerm);
  };

  const handleSearch = searchTerm => {
    const newUrl = getUrl(searchTerm);
    setUrls(urls.filter(url => url !== newUrl).concat(newUrl).slice(-5));
  };

  const lastSearches = getLastSearches(urls);

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    {data: [], isLoading: false, isError: false}
  );

  const handleFetchStories = React.useCallback(async () => {
    dispatchStories({type: 'STORIES_FETCH_INIT'});

    try {
      const lastUrl = urls[urls.length - 1];
      const result = await axios.get(lastUrl);

      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: result.data.hits,
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

      <LastSearches lastSearches={lastSearches} onLastSearch={handleLastSearch} />

      <hr/>

      {stories.isError && <p>Something went wrong...</p>}

      {stories.isLoading ? (
        <p>Loading...</p>
      ): (
        <List list={stories.data} onRemoveItem={handleRemoveStory}/>
      )}
      
      
    </div>
  );
};



const SearchForm = ({searchTerm, onSearchInput, onSearchSubmit,}) => (
  <form onSubmit={onSearchSubmit} className="search-form">
  <InputWithLabel id='search' value={searchTerm} isFocused onInputChange={onSearchInput}>
    <strong>Search:</strong>
  </InputWithLabel>

  <button type="submit" disabled={!searchTerm} className="button button_large">
    Submit
  </button>
</form>
);

const LastSearches = ({lastSearches, onLastSearch}) => (
  <>
  {lastSearches.map((searchTerm, index) => (
    <button key={searchTerm + index} type="button" onClick={() => onLastSearch(searchTerm)}>
      {searchTerm}
    </button>
  ))}
  </>
);



const InputWithLabel = ({id, label, value, type='text', isFocused, onInputChange, children}) =>  {
  const inputRef = React.useRef();

  React.useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <>
      <label htmlFor={id} className="label">{children}</label>
      &nbsp;
      <input ref={inputRef} id={id} type={type} value={value} onChange={onInputChange} className="input"/>
    </>
  );
};


const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENT: list => sortBy(list, 'num_comments'),
  POINT: list => sortBy(list, 'points'),

};


const List = ({list, onRemoveItem}) => {
  const [sort, setSort] = React.useState({
    sortKey: 'NONE',
    isReverse: false,
  });

  const handleSort = sortKey => {
    const isReverse = sort.sortKey === sortKey && !sort.isReverse;
    setSort({sortKey, isReverse});
  };

  const sortFunction = SORTS[sort.sortKey];
  const sortedList = sort.isReverse ? sortFunction(list).reverse() : sortFunction(list);

  return (
    <div>
      <div className="item item_title">
        <span style={{width: '40% '}}>
          <button type="button" onClick={() => handleSort('TITLE')} className="button button_title">
            Title
          </button>
          <SortingArrow descending={sort.isReverse} isSorted={sort.sortKey==='TITLE'}/>
        </span>
        <span style={{width: '30%'}}>
          <button type="button" onClick={() => handleSort('AUTHOR')} className="button button_title">
            Author
          </button>
          <SortingArrow descending={sort.isReverse} isSorted={sort.sortKey==='AUTHOR'}/>
        </span>
        <span style={{width: '10% ', textAlign: "center"}}>
          <button type="button" onClick={() => handleSort('COMMENT')} className="button button_title">
            Comments
          </button>
          <SortingArrow descending={sort.isReverse} isSorted={sort.sortKey==='COMMENT'}/>
        </span>
        <span style={{width: '10% ', textAlign: "center"}}>
          <button type="button" onClick={() => handleSort('POINT')} className="button button_title">
            Points
          </button>
          <SortingArrow descending={sort.isReverse} isSorted={sort.sortKey==='POINT'}/>
        </span>
        <span style={{width: '10% ', textAlign: "center"}}>Dismiss</span>
      </div> 
      {sortedList.map(item => <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem}/>)}
    </div>
  );
};

const SortingArrow = ({descending, isSorted}) => {
  if (!isSorted) return null;
  if (descending) {
    return <DownArrow height="18px" width="18px" className="arrow"/>
  } else {
    return <UpArrow height="18px" width="18px" className="arrow"/>
  }
};

const Item = ({item, onRemoveItem}) => (
  <div className="item">
    <span style={{width: '40% '}}>
      <a href={item.url}>{item.title}</a>
    </span>
    <span style={{width: '30% '}}>{item.author}</span>
    <span style={{width: '10% ', textAlign: "center"}}>{item.num_comments}</span>
    <span style={{width: '10% ', textAlign: "center"}}>{item.points}</span>
    <span style={{width: '10% ', textAlign: "center"}}>
      <button type="button" onClick={() => onRemoveItem(item)} className="button button_small">
        <Check height="18px" width="18px" />
      </button>
    </span>
  </div>
);

export default App;
