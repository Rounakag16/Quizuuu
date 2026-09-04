const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

let initialized = false

// Loads gtag.js lazily, only when a measurement ID is actually configured —
// so local dev (no VITE_GA_MEASUREMENT_ID set) stays silent instead of
// firing requests at an empty id.
export function initAnalytics() {
  if (!GA_ID || initialized) return
  initialized = true

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  // send_page_view: false — this is a single-page app with no real routes,
  // so page views are sent manually per screen change (see trackPageView).
  window.gtag('config', GA_ID, { send_page_view: false })
}

export function trackPageView(screenName) {
  if (!GA_ID || !window.gtag) return
  window.gtag('event', 'page_view', {
    page_title: screenName,
    page_path: `/${screenName}`,
  })
}

export function trackEvent(name, params = {}) {
  if (!GA_ID || !window.gtag) return
  window.gtag('event', name, params)
}
