// lib
import React, { Component } from "react";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import debounce from "lodash/debounce";
import { fetchBooks } from "../../store/actions/bookActions";
const R = require("ramda");
// src
import BookSummary from "./BookSummary";
import {
  State,
  Props,
  DispatchProps,
  BookListState,
  Result,
  Book
} from "../../types/types";
// styles
import "./BookList.css";

class BookList extends Component<Props, BookListState> {
  state = {
    isLoading: true
  };

  componentDidMount() {
    window.addEventListener("scroll", this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }
  handleScroll = () => {
    const wrappedElement = document.getElementById("books");
    if (wrappedElement && this.isBottom(wrappedElement)) {
      this.fetchNextPage();
    }
  };
  isBottom(el: HTMLElement) {
    return el.getBoundingClientRect().bottom <= window.innerHeight;
  }
  fetchNextPage = debounce(() => {
    const { books, query, fetchBooks } = this.props;

    // find books matching the query, and get pageLastFetched and pagesCount
    // const { page: pageLastFetched = 0, pagesCount = 0 } =
    //   books.find(b => b.query == query) || {};

    const { page: pageLastFetched = 0, pagesCount = 0 } =
      R.find((b: Result) => b.query == query, books) || {};

    // if (pageLastFetched < pagesCount) {
    if (R.lt(pageLastFetched, pagesCount)) {
      this.setState({ isLoading: true });
      fetchBooks(query, pageLastFetched + 1);
    } else {
      this.setState({ isLoading: false });
      console.log("No more pages to fetch...");
    }
  }, 1000);
  render() {
    const { books, query } = this.props;
    // const { isLoading } = this.state;
    // find books matching the query, and get pageLastFetched, pagesCount and items
    const { items = [], pagesCount = 0, page: pageLastFetched = 0 } =
      R.find((b: Result) => b.query == query, books) || {};

    return (
      <div className="container">
        <div className="row">
          <div className="col s12 m6">
            <ul id="books">
              {items.map((book: Book) => (
                <BookSummary book={book} key={book.id} />
              ))}
            </ul>
          </div>

          {items.length && R.gt(items.length, 0) && (
            <div className="col s12 m5 offset-m1">
              {<p>Total Pages: {pagesCount}</p>}
              {<p>Page Last Fetched: {pageLastFetched}</p>}
            </div>
          )}
        </div>
        {/* {console.log(isLoading)}
        {(items.length <= 0 || isLoading) && (
          <div id="loading">Loading....</div>
        )} */}
      </div>
    );
  }
}

const mapStateToProps = (state: State) => {
  const {
    book: { books = [], query = "", pageLastFetched = 0, pagesCount = 0 } = {}
  } = state;
  return { books, query, pageLastFetched, pagesCount };
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<{}, {}, any>
): DispatchProps => {
  return {
    fetchBooks: async (query: string, page: number) => {
      await dispatch(fetchBooks(query, page));
    },
    history: ""
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BookList);
