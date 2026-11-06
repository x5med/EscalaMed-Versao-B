const transientFields = {
  error_type: undefined,
  error_message: undefined,
  error_field: undefined,
  percent_scrolled: undefined,
};

export function pushEvent(event: string, payload: Record<string, unknown> = {}) {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ ...transientFields, event, ...payload });
  // GTM retains values between pushes, including events emitted by other tags.
  window.dataLayer.push({ ...transientFields });
}
