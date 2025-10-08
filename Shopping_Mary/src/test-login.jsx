import { supabase } from "./supabaseClient";

export default function TestLogin() {
  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "http://localhost:5173/" }
    });
  };

  return <button onClick={login}>Login con Google</button>;
}
