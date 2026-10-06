declare global {
  interface Window {
    mockSupabaseUser: (userData?: any) => any
    mockSupabaseClient: () => any
  }

  const mockSupabaseUser: (userData?: any) => any
  const mockSupabaseClient: () => any
}
