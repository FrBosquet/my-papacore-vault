import { DateTime } from 'luxon'

// Create a mock implementation of dc.coerce.date
// This mimics Datacore's behavior of parsing date strings to Luxon DateTime
const mockCoerceDate = (input: string | Date | number): DateTime | null => {
  try {
    if (typeof input === 'string') {
      // Try parsing various date formats
      const dt = DateTime.fromISO(input)
      if (dt.isValid) {
        return dt
      }
      // Try parsing as date string (YYYY-MM-DD)
      const dt2 = DateTime.fromFormat(input, 'yyyy-MM-dd')
      if (dt2.isValid) {
        return dt2
      }
      return null
    } else if (input instanceof Date) {
      return DateTime.fromJSDate(input)
    } else if (typeof input === 'number') {
      return DateTime.fromMillis(input)
    }
    return null
  } catch {
    return null
  }
}

// Set up the global dc object
// Using Object.assign to avoid TypeScript conflicts with the global type declaration
Object.assign(globalThis, {
  dc: {
    luxon: {
      DateTime
    },
    coerce: {
      date: mockCoerceDate,
    },
    api: {
      page: () => null,
      coerce: {
        date: mockCoerceDate,
      },
    },
    app: {
      vault: {
        adapter: {
          getResourcePath: (path: string) => path,
        },
        getFileByPath: () => null,
        read: async () => '',
        create: async () => null,
        modify: async () => {},
      },
    },
    useQuery: () => [],
    require: async () => ({}),
  },
})

