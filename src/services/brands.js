import { supabase } from "@/lib/supabase/client";

const TABLE = "brands";

/**
 * Get active brands.
 *
 * Intended for product forms and brand selectors.
 */
export async function getBrands() {
    const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .eq("is_active", true)
        .order("name");

    if (error) throw error;

    return data;
}

/**
 * Get all brands.
 *
 * Intended for brand management.
 */
export async function getAllBrands() {
    const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .order("name");

    if (error) throw error;

    return data;
}

/**
 * Create a brand.
 */
export async function createBrand({
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
 * Update a brand.
 */
export async function updateBrand(
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
 * Delete a brand.
 */
export async function deleteBrand(id) {
    const { error } = await supabase
        .from(TABLE)
        .delete()
        .eq("id", id);

    if (error) throw error;
}