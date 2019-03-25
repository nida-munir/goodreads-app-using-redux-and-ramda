const R = require("ramda");
import { Result } from "../../types/types";

const initState = {
  books: [
    {
      page: 1,
      query: "",
      items: [],
      pagesCount: 0
    }
  ]
};

interface Action {
  type: string;
  data: any;
}
const projectReducer = (state = initState, action: Action) => {
  const { books } = state;
  const { data = {}, type } = action;
  const { query, page, pagesCount, items } = data;
  switch (type) {
    case "FETCH_BOOK_FROM_STORE":
      return { books, query };
    case "FETCH_BOOK":
      // const index = books.findIndex(b => b.query === query);
      const index = R.findIndex((b: Result) => b.query === query, books);
      if (index === -1) {
        return {
          books: books.concat(data),
          query,
          pageLastFetched: page,
          pagesCount,
          isLoading: false
        };
      } else {
        // if (books[index].page >= page) return state;
        if (R.gte(books[index].page, page)) return state;
        const prevItems = books[index].items;
        // const allItems = [...prevItems, ...items];
        const allItems = R.concat(prevItems, items);
        data.items = allItems;

        let updatedBooks = R.filter((b: Result) => b.query !== query, books);
        updatedBooks = R.concat(data, updatedBooks);
        return {
          // books: books.filter(b => b.query !== query).concat(data),
          books: updatedBooks,
          query,
          pageLastFetched: page,
          pagesCount,
          isLoading: false
        };
      }
    case "FETCH_BOOK_ERROR":
      console.log(data);
    default:
      return state;
  }
};

export default projectReducer;
