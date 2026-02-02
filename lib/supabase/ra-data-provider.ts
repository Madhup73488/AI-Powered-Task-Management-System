import { DataProvider, GetListParams, GetManyReferenceParams, DeleteParams, RaRecord, DeleteResult } from "ra-core";
import { supabase } from "./client"; // Your Supabase client
import { MOCK_ADMIN_USER, USE_MOCK_AUTH } from "./auth-helpers"; // Import mock auth settings

// This is a very basic Supabase data provider for React Admin.
// For a full-featured provider, you might want to use a library like ra-supabase.
export const supabaseDataProvider: DataProvider = {
  getList: async (resource, params: GetListParams) => {
    if (USE_MOCK_AUTH && resource === "users") {
      console.log("Mock DataProvider: getList for users.");
      return Promise.resolve({
        data: [MOCK_ADMIN_USER],
        total: 1,
      });
    }

    const { pagination = { page: 1, perPage: 10 }, sort = { field: "id", order: "ASC" } } = params;

    const { data, error, count } = await supabase
      .from(resource)
      .select("*", { count: "exact" })
      .range(
        (pagination.page - 1) * pagination.perPage,
        pagination.page * pagination.perPage - 1
      )
      .order(sort.field, { ascending: sort.order.toLowerCase() === "asc" });

    if (error) {
      throw new Error(error.message);
    }

    return {
      data: data || [],
      total: count || 0,
    };
  },

  getOne: async (resource, params) => {
    if (USE_MOCK_AUTH && resource === "users" && params.id === MOCK_ADMIN_USER.id) {
      console.log("Mock DataProvider: getOne for admin user.");
      return Promise.resolve({ data: MOCK_ADMIN_USER });
    }

    const { data, error } = await supabase
      .from(resource)
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      throw new Error(error.message);
    }
    if (!data) {
      throw new Error(`Resource ${resource} with id ${params.id} not found`);
    }

    return { data };
  },

  getMany: async (resource, params) => {
    if (USE_MOCK_AUTH && resource === "users") {
      console.log("Mock DataProvider: getMany for users.");
      return Promise.resolve({ data: [MOCK_ADMIN_USER] });
    }

    const { data, error } = await supabase
      .from(resource)
      .select("*")
      .in("id", params.ids);

    if (error) {
      throw new Error(error.message);
    }

    return { data: data || [] };
  },

  getManyReference: async (resource, params: GetManyReferenceParams) => {
    if (USE_MOCK_AUTH && resource === "users") {
      console.log("Mock DataProvider: getManyReference for users.");
      return Promise.resolve({ data: [MOCK_ADMIN_USER], total: 1 });
    }

    const { pagination = { page: 1, perPage: 10 }, sort = { field: "id", order: "ASC" } } = params;

    const { data, error, count } = await supabase
      .from(resource)
      .select("*", { count: "exact" })
      .eq(params.target, params.id)
      .range(
        (pagination.page - 1) * pagination.perPage,
        pagination.page * pagination.perPage - 1
      )
      .order(sort.field, { ascending: sort.order.toLowerCase() === "asc" });

    if (error) {
      throw new Error(error.message);
    }

    return {
      data: data || [],
      total: count || 0,
    };
  },

  update: async (resource, params) => {
    if (USE_MOCK_AUTH && resource === "users" && params.id === MOCK_ADMIN_USER.id) {
      console.log("Mock DataProvider: update for admin user.");
      return Promise.resolve({ data: { ...MOCK_ADMIN_USER, ...params.data } as RaRecord });
    }

    const { data, error } = await supabase
      .from(resource)
      .update(params.data)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    if (!data) {
      throw new Error(`Resource ${resource} with id ${params.id} not found for update`);
    }

    return { data };
  },

  updateMany: async (resource, params) => {
    if (USE_MOCK_AUTH && resource === "users") {
      console.log("Mock DataProvider: updateMany for users.");
      return Promise.resolve({ data: params.ids });
    }

    const { error } = await supabase
      .from(resource)
      .update(params.data)
      .in("id", params.ids);

    if (error) {
      throw new Error(error.message);
    }

    return { data: params.ids };
  },

  create: async (resource, params) => {
    if (USE_MOCK_AUTH && resource === "users") {
      console.log("Mock DataProvider: create for users.");
      return Promise.resolve({ data: { id: "mock-new-user-id", ...params.data } as RaRecord });
    }

    const { data, error } = await supabase
      .from(resource)
      .insert(params.data)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    if (!data) {
      throw new Error(`Failed to create resource ${resource}`);
    }

    return { data };
  },

  delete: async (resource, params: DeleteParams) => {
    if (USE_MOCK_AUTH && resource === "users" && params.id === MOCK_ADMIN_USER.id) {
      console.log("Mock DataProvider: delete for admin user (not allowed in mock).");
      return Promise.reject("Deleting mock admin user is not allowed.");
    }

    const { error } = await supabase.from(resource).delete().eq("id", params.id);

    if (error) {
      throw new Error(error.message);
    }

    return { data: params.previousData || { id: params.id } as RaRecord };
  },

  deleteMany: async (resource, params) => {
    if (USE_MOCK_AUTH && resource === "users") {
      console.log("Mock DataProvider: deleteMany for users.");
      return Promise.resolve({ data: params.ids });
    }

    const { error } = await supabase
      .from(resource)
      .delete() // Changed from update to delete
      .in("id", params.ids);

    if (error) {
      throw new Error(error.message);
    }

    return { data: params.ids };
  },
};
