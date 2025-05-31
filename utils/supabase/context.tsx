"use client"

import { Database } from "@/types/database.types";
import { useSession } from "@clerk/nextjs";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { createContext, useContext, useMemo, ReactNode } from "react";

const SupabaseContext = createContext<SupabaseClient<Database> | undefined>(undefined);

export function SupabaseProvider({ children }: { children: ReactNode }) {
    const { session } = useSession();

    const supabase = useMemo(() => {
        return createClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_KEY!,
            {
                global: {
                    fetch: async (url, options = {}) => {
                        const clerkToken = await session?.getToken({
                            template: 'supabase',
                        });

                        const headers = new Headers(options?.headers);
                        headers.set('Authorization', `Bearer ${clerkToken}`);

                        // Add duplex option for requests with body
                        const fetchOptions: RequestInit = {
                            ...options,
                            headers,
                        };

                        if (options.body && options.method !== 'GET' && options.method !== 'HEAD') {
                            (fetchOptions as any).duplex = 'half';
                        }

                        return fetch(url, fetchOptions);
                    },
                },
            },
        );
    }, [session]);

    return (
        <SupabaseContext.Provider value={supabase}>
            {children}
        </SupabaseContext.Provider>
    );
}

// Hook to use the Supabase client
export function useSupabase() {
    const context = useContext(SupabaseContext);
    if (context === undefined) {
        throw new Error('useSupabase must be used within a SupabaseProvider');
    }
    return context;
}