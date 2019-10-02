import React, { Component } from 'react';
import './App.css';
// import { throwStatement } from '@babel/types';

const DEFAULT_QUERY = 'tampa';
const DEFAULT_FILTER = '';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';

function isFiltered(filterTerm) {
  return function(item) { 
    if(item.title) 
      return item.title.toLowerCase().includes(filterTerm.toLowerCase());
    else
      return false;
  }
}

const Button = ({ onClick, className = '', children }) =>
  <button
    onClick={onClick}
    className={className}
    type="button"
  >
    {children}
  </button>  

const Filter = ({
  value,
  onChange,
  children
}) =>
  <form>
    {children} <input
      type="text"
      value={value}
      onChange={onChange}
    /> 
  </form>

class Search extends Component { 
  componentDidMount() {
    if (this.input) {
      this.input.focus(); // focus search input
    }
  }

  render() {
    const {
      value, 
      onChange,
      onSubmit,
      children
    } = this.props;

    return (
      <form onSubmit={onSubmit}>
        {children} <input
          type="text"
          value={value}
          onChange={onChange}
          ref={el => this.input = el} // reference DOM element so search input can be focused on load
        />
        <button type="submit">
          {children}
        </button>
      </form>
    );
  }
}

const Table = ({ list, pattern, onDismiss }) =>
  <div className="table">
    {list.filter(isFiltered(pattern)).map( item =>
      <div key={item.objectID} className="table-row">
        <span style={{ width: '50%'}}>
          <a href={item.url}>{item.title}</a>
        </span>
        <span style={{ width: '20%'}}>{item.author}</span>
        <span style={{ width: '10%'}}>{item.num_comments}</span>
        <span style={{ width: '10%'}}>{item.points}</span>
        <span style={{ width: '10%'}}>
          <Button 
            onClick={() => onDismiss(item.objectID)}
            className="button-inline"
          >
            Dismiss
          </Button>
        </span>
      </div>
    )}
  </div>    


class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      result: null,
      searchTerm: DEFAULT_QUERY,
      filterTerm: DEFAULT_FILTER,
      error: null,
    }

    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
  }

  setSearchTopStories(result) {
    // concat for paginated fetch
    const { hits, page } = result;

    // check if there are old hits
    const oldHits = page !== 0
      ? this.state.result.hits
      : [];

    // merge old and new hits  
    const updatedHits = [ ...oldHits, ...hits ];  // array spread operator

    this.setState({ 
      result: { hits: updatedHits, page }
    });
  }

  fetchSearchTopStories(searchTerm, page = 0) {
    const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`;
    //const url = PATH_BASE + PATH_SEARCH + '?' + PARAM_SEARCH + DEFAULT_QUERY;

    fetch(url)
      .then(response => response.json())
      .then(result => this.setSearchTopStories(result))
      .catch(error => this.setState({ error }));
  }

  componentDidMount() {
    const { searchTerm } = this.state;
    this.fetchSearchTopStories(searchTerm);
  }

  onSearchSubmit(event) {
    const { searchTerm } = this.state;
    this.fetchSearchTopStories(searchTerm);
    event.preventDefault();
  }

  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value });
  }

  onFilterChange(event) {
    this.setState({ filterTerm: event.target.value });
  }

  onDismiss(id) {
    const isNotId = item => item.objectID !== id;
    const updatedHits = this.state.result.hits.filter(isNotId);
    this.setState({ 
      result: { ...this.state.result, hits: updatedHits }
    });
  }

  render() {
    const { searchTerm, filterTerm, result, error } = this.state;
    const page = (result && result.page) || 0;

    //if (!result) { return null; }

    return (
      <div className="page">
        <div className="interacions">
            <Search
              value={searchTerm}
              onChange={this.onSearchChange}
              onSubmit={this.onSearchSubmit}
            >
              Search
            </Search>
            <Filter
              value={filterTerm}
              onChange={this.onFilterChange}
            >
              Filter
            </Filter>
        </div>
        { error    // conditional rendering
          ? <div className="interactions">
              <p>Something went wrong.</p>
            </div>
          : result &&
          <Table
            list={result.hits}
            pattern={filterTerm}
            onDismiss={this.onDismiss}
          />
        }
        <div className="interactions">
          <Button onClick={() => this.fetchSearchTopStories(searchTerm, page + 1)}>
            More
          </Button>
        </div>
      </div>
    )
  }
}

export default App;
