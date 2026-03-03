export type QueryKey = readonly unknown[];

export interface BffQueryResult<T> {
  queryKey: QueryKey;
  promise: Promise<T>;
}

export interface BffHookOptions {
  enabled?: boolean;
}
