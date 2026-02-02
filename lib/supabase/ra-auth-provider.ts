import { AuthProvider } from "ra-core";
import { supabase } from "./client"; // Your Supabase client
import { MOCK_ADMIN_USER, USE_MOCK_AUTH } from "./auth-helpers"; // Import mock auth settings

export const supabaseAuthProvider: AuthProvider = {
  login: async ({ username, password }) => {
    if (USE_MOCK_AUTH && username === MOCK_ADMIN_USER.email && password === "pass123") {
      console.log("Mock AuthProvider: Login successful.");
      localStorage.setItem("supabase_user_email", username);
      return Promise.resolve();
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: username,
      password,
    });
    if (error) {
      if (error.message === "Email not confirmed") {
        throw new Error("Please check your email to confirm your account before signing in.");
      }
      throw new Error(error.message);
    }
    localStorage.setItem("supabase_user_email", username);
    return Promise.resolve();
  },

  logout: async () => {
    if (USE_MOCK_AUTH) {
      console.log("Mock AuthProvider: Logout successful.");
      localStorage.removeItem("supabase_user_email");
      return Promise.resolve();
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
    localStorage.removeItem("supabase_user_email");
    return Promise.resolve();
  },

  checkAuth: async () => {
    if (USE_MOCK_AUTH) {
      console.log("Mock AuthProvider: CheckAuth.");
      return localStorage.getItem("supabase_user_email") ? Promise.resolve() : Promise.reject();
    }
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      return Promise.reject();
    }
    return Promise.resolve();
  },

  checkError: async (error) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem("supabase_user_email");
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getPermissions: async () => {
    if (USE_MOCK_AUTH) {
      console.log("Mock AuthProvider: GetPermissions.");
      const email = localStorage.getItem("supabase_user_email");
      if (email === MOCK_ADMIN_USER.email) {
        return Promise.resolve("admin");
      }
      return Promise.resolve("employee");
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return Promise.reject("No user found");
    }

    // Fetch the user's role from the public.users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error("Error getting user profile for permissions:", profileError);
      return Promise.reject("Failed to get user permissions");
    }

    return Promise.resolve(userProfile.role);
  },

  getIdentity: async () => {
    if (USE_MOCK_AUTH) {
      console.log("Mock AuthProvider: GetIdentity.");
      const email = localStorage.getItem("supabase_user_email");
      if (email === MOCK_ADMIN_USER.email) {
        return Promise.resolve({
          id: MOCK_ADMIN_USER.id,
          fullName: MOCK_ADMIN_USER.user_metadata.full_name,
          avatar: MOCK_ADMIN_USER.user_metadata.avatar || undefined,
        });
      }
      // For a non-admin mock user, you'd return different data
      return Promise.reject("No mock identity for non-admin");
    }

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return Promise.reject("No user found");
    }

    // Fetch the user's full_name from the public.users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('full_name, profile_image')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error("Error getting user profile for identity:", profileError);
      return Promise.reject("Failed to get user identity");
    }

    return Promise.resolve({
      id: user.id,
      fullName: userProfile.full_name || user.email,
      avatar: userProfile.profile_image || undefined,
    });
  },
};
