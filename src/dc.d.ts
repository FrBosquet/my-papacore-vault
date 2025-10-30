/// <reference types="preact" />

import type { DatacoreLocalApi, Indexable } from '@blacksmithgu/datacore'
import type { JSX as PreactJSX } from 'preact'

// Re-export commonly used types for convenience
export type { Indexable }

// Declare the jsx-runtime module to silence TypeScript errors
declare module 'preact/jsx-runtime' {
  export * from 'preact'
}

// Make Preact JSX types available globally
declare global {
  /**
   * Global dc object - the Datacore Local API
   */
  const dc: DatacoreLocalApi & {
    useQuery<T = Indexable>(query: string, settings?: { debounce?: number }): Array<Indexable & T>
  }

  namespace JSX {
    interface Element extends PreactJSX.Element {}
    interface IntrinsicElements extends PreactJSX.IntrinsicElements {}
    interface ElementChildrenAttribute extends PreactJSX.ElementChildrenAttribute {}
  }
}
