import { useEffect, useRef } from 'react'

/**
 * Custom hook for scroll-reveal animations using IntersectionObserver.
 * Adds 'reveal-visible' class to elements with 'reveal' class when they enter the viewport.
 *
 * @param {Object} options
 * @param {number} options.threshold - Visibility threshold (0-1), default 0.1
 * @param {string} options.rootMargin - Root margin, default '0px 0px -40px 0px'
 * @param {boolean} options.stagger - Enable stagger delays for child elements
 */
export default function useScrollReveal({
  threshold = 0.1,
  rootMargin = '0px 0px -40px 0px',
  stagger = false,
} = {}) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const elements = container.querySelectorAll('.reveal')
    if (elements.length === 0) return

    // Apply stagger delays to children
    if (stagger) {
      elements.forEach((el, i) => {
        const delayClass = `reveal-delay-${Math.min(i + 1, 6)}`
        el.classList.add(delayClass)
      })
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold, rootMargin }
    )

    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [threshold, rootMargin, stagger])

  return containerRef
}
