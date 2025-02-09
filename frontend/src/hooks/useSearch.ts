import {
  QueryKey,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import React, { useState } from "react";
import { useDebounce } from "./useDebounce";

interface SearchParams {
  search: string;
  [key: string]: any;
}

export const useSearch = <TData, TError = unknown>(
  searchFn: (params: SearchParams) => Promise<TData>,
  initialSearchValue: string = "",
  delay: number = 300,
  queryKeyPrefix: string | QueryKey,
  additionalParams: { [key: string]: any } = {},
  queryOptions?: UseQueryOptions<TData, TError>
): {
  searchValue: string;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
  results: TData | undefined;
  queryInfo: UseQueryResult<TData, TError>;
} => {
  const [searchValue, setSearchValue] = useState<string>(initialSearchValue);
  const debouncedSearchValue = useDebounce<string>(searchValue, delay);

  const queryInfo = useQuery<TData, TError>({
    queryKey: [
      queryKeyPrefix,
      { search: debouncedSearchValue, ...additionalParams },
    ],
    queryFn: () =>
      searchFn({ search: debouncedSearchValue, ...additionalParams }),
    enabled: !!debouncedSearchValue,
    staleTime: 300000,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

  return {
    searchValue,
    setSearchValue,
    results: queryInfo.data,
    queryInfo,
  };
};

export default useSearch;
