import { supabase } from "@/lib/supabase/client";

const TABLE = "categories";

/**

* Get active categories.
*
* Intended for product forms and category selectors.
  */
  export async function getCategories() {
  const { data, error } = await supabase
  .from(TABLE)
  .select("*")
  .eq("is_active", true)
  .order("name");

  if (error) throw error;

  return data;
  }

/**

* Get all categories.
*
* Intended for category management.
  */
  export async function getAllCategories() {
  const { data, error } = await supabase
  .from(TABLE)
  .select("*")
  .order("name");

  if (error) throw error;

  return data;
  }

/**

* Create a category.
  */
  export async function createCategory({
  name,
  description = null,
  is_active = true,
  }) {
  const { data, error } = await supabase
  .from(TABLE)
  .insert({
  name,
  description,
  is_active,
  })
  .select()
  .single();

  if (error) throw error;

  return data;
  }

/**

* Update a category.
  */
  export async function updateCategory(
  id,
  {
  name,
  description = null,
  is_active = true,
  },
  ) {
  const { data, error } = await supabase
  .from(TABLE)
  .update({
  name,
  description,
  is_active,
  })
  .eq("id", id)
  .select()
  .single();

  if (error) throw error;

  return data;
  }

/**

* Delete a category.
  */
  export async function deleteCategory(id) {
  const { error } = await supabase
  .from(TABLE)
  .delete()
  .eq("id", id);

  if (error) throw error;
  }
