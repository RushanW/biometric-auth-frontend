export function track(event: string, props?: Record<string, any>) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('[telemetry]', event, props ?? {});
  }
}