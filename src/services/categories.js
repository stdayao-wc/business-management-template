import { supabase } from "@/lib/supabase";

const TABLE = "categories";

export async function getCategories() {
    const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .eq("is_active", true)
        .order("name");

    if (error) throw error;

    return data;
}