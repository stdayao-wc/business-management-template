import { supabase } from "@/lib/supabase";

const TABLE = "brands";

export async function getBrands() {
    const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .eq("is_active", true)
        .order("name");

    if (error) throw error;

    return data;
}