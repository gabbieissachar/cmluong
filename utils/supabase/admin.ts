import { createClient } from '@supabase/supabase-js'
import type { Database, Tables, TablesInsert } from '@/types/database.types'

export function createAdminClient() {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      global: {
        fetch: async (url, options = {}) => {
          // Add duplex option for requests with body
          const fetchOptions: RequestInit = {
            ...options,
          }

          if (options.body && options.method !== 'GET' && options.method !== 'HEAD') {
            ;(fetchOptions as any).duplex = 'half'
          }

          return fetch(url, fetchOptions)
        },
      },
    }
  )

  return supabase
}

// Note: supabaseAdmin uses the SERVICE_ROLE_KEY which you must only use in a secure server-side context
// as it has admin privileges and overwrites RLS policies!
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    global: {
      fetch: async (url, options = {}) => {
        // Add duplex option for requests with body
        const fetchOptions: RequestInit = {
          ...options,
        }

        if (options.body && options.method !== 'GET' && options.method !== 'HEAD') {
          ;(fetchOptions as any).duplex = 'half'
        }

        return fetch(url, fetchOptions)
      },
    },
  }
)
