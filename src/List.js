import React from 'react';
import {sortBy} from 'lodash';
import {ReactComponent as Check} from './svg/check.svg';
import {ReactComponent as DownArrow} from './svg/downArrow.svg';
import {ReactComponent as UpArrow} from './svg/upArrow.svg';

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

export default List;