import * as bs from 'bootstrap'

declare global {
  const bootstrap: typeof bs

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace bootstrap {
    type Modal = bs.Modal
    type Dropdown = bs.Dropdown
  }

  interface Window {
    bootstrap: typeof bs
  }
}
