import { QueryClient } from "@tanstack/react-query";

export type PrefetchQuery = {
  key: string[];
  fetchFn: () => Promise<any>;
};

export const prefetchQueries = async (queries: PrefetchQuery[]) => {
  const queryClient = new QueryClient();

  await Promise.all(
    queries.map((query) =>
      queryClient.prefetchQuery({
        queryKey: query.key,
        queryFn: query.fetchFn,
      })
    )
  );

  return queryClient;
};

export const prefetchQuery = async (
  key: string[],
  fetchFn: () => Promise<any>
) => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: key,
    queryFn: fetchFn,
  });
  return queryClient;
};
