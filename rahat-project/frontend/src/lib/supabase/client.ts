import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const createStub = (): any => {
      const stub: any = () => stub;
      stub.select = () => stub;
      stub.order = () => stub;
      stub.eq = () => stub;
      stub.single = () => Promise.resolve({ data: null, error: null });
      stub.insert = () => stub;
      stub.update = () => stub;
      stub.delete = () => stub;
      stub.upsert = () => stub;
      stub.upload = () => Promise.resolve({ error: { message: "Setup required" } });
      stub.getPublicUrl = () => ({ data: { publicUrl: "" } });
      stub.getUser = () => Promise.resolve({ data: { user: null }, error: null });
      stub.onAuthStateChange = () => ({ data: { subscription: { unsubscribe: () => {} } } });
      stub.signInWithPassword = () => Promise.resolve({ error: { message: "Setup required" } });
      stub.signUp = () => Promise.resolve({ error: { message: "Setup required" } });
      stub.signOut = () => Promise.resolve({});
      return stub;
    };
    const stub = {
      from: createStub,
      auth: createStub(),
      storage: { from: createStub }
    };
    return stub as any;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
