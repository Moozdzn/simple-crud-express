import { useEffect, useReducer } from 'react'
import './App.css'
import ProductList from './components/product-list'
import type { Product } from '../../shared/schemas'

type State = {
	loading: boolean;
	products?: Product[];
  nextPageLink?: string;
  previousPageLink?: string;
	error?: { error: string };
};
type DataReducer = (state: State, action: Action) => State

type Action =
  | { type: "ERROR"; error: State["error"] }
  | { type: "DATA"; data: Omit<State, "error" | "loading"> }
  | { type: "LOADING" }

const reducer: DataReducer = (state, action) => {
	if (action.type === "ERROR") {
		return {
			...state,
			loading: false,
			error: action.error,
		};
	}

	if (action.type === "DATA") {
		return {
			...state,
			loading: false,
			products: action.data.products,
      nextPageLink: action.data.nextPageLink,
      previousPageLink: action.data.previousPageLink,
		};
	}

  if (action.type === "LOADING") {
    return {
      ...state,
      loading: true,
    };
  }

	throw new Error("Unknown action type");
}

const fetchProducts = async (link?: string) => {
  let endpoint = "api/v1/products";
  if (link) {
    const url = new URL(link);
    const searchParams = new URLSearchParams(url.search);
    const page = searchParams.get("page") ?? 1;
    const per_page = searchParams.get("per_page") ?? 20;
    endpoint = `api/v1/products?page=${page}&per_page=${per_page}`;
  }

  return fetch(endpoint, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
  }).then(res => res.json());
}

export default function App() {
  const [state, dispatch] = useReducer<DataReducer>(reducer, {
    loading: true
  })

  const handleFetchProducts = (link?: string) => {
		fetchProducts(link)
			.then((data) =>
				dispatch({
					type: "DATA",
					data: {
						products: data.products,
						nextPageLink: data.meta.next_page_link,
						previousPageLink: data.meta.previous_page_link,
					},
				})
			)
			.catch((error) => dispatch({ type: "ERROR", error }));
  };

  useEffect(() => {
    handleFetchProducts()
  }, [])

  console.log(state)

  if (state.loading) {
    return <div>Loading...</div>
  }

  if (state.error) {
    return <div>{state.error.error}</div>
  }

  return (
		<>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "10px",
				}}
			>
				<button
					type="button"
					onClick={() => handleFetchProducts(state.previousPageLink)}
          disabled={!state.previousPageLink}
				>
					Previous
				</button>
				<h1>Products</h1>
				<button
					type="button"
					onClick={() => handleFetchProducts(state.nextPageLink)}
          disabled={!state.nextPageLink}
				>
					Next
				</button>
			</div>
			{state.products && <ProductList products={state.products} />}
		</>
  );
}