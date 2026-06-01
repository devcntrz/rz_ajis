/** List views: fetch only when SWR key changes (e.g. user clicks Search), not on focus/reconnect. */
export const LIST_SWR_OPTIONS = {
  revalidateOnFocus:     false,
  revalidateOnReconnect: false,
  refreshInterval:       0,
} as const;
