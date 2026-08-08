import { supabase } from "@/lib/supabase/client";
import { generateStorageFilename } from "@/lib/files";

const TABLE = "products";
const BUCKET = "product-images";

/* ==========================================================================
   READ
   ========================================================================== */

export async function getProducts() {
    const { data, error } = await supabase
        .from(TABLE)
        .select(`
            *,
            categories (
                id,
                name
            ),
            brands (
                id,
                name
            )
        `)
        .eq("is_active", true)
        .order("name");

    if (error) throw error;

    return data.map(product => ({
        ...product,
        image_url: getProductImageUrl(product.image_path),
    }));
}

export async function getProduct(id) {
    const { data, error } = await supabase
        .from(TABLE)
        .select(`
            *,
            categories (
                id,
                name
            ),
            brands (
                id,
                name
            )
        `)
        .eq("id", id)
        .single();

    if (error) throw error;

    return {
        ...data,
        image_url: getProductImageUrl(data.image_path),
    };
}

async function generateProductSku({
    brandId,
    productName,
}) {
    let prefix = null;

    if (brandId) {
        const { data, error } = await supabase
            .from("brands")
            .select("name")
            .eq("id", brandId)
            .single();

        if (error) {
            throw error;
        }

        prefix = data?.name;
    }

    if (!prefix) {
        prefix = productName
            ?.trim()
            .split(/\s+/)[0];
    }

    prefix = prefix
        ?.trim()
        .split(/\s+/)[0]
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");

    if (!prefix) {
        prefix = "PRD";
    }

    const { data, error } = await supabase
        .rpc("get_next_product_sku_number");

    if (error) {
        throw error;
    }

    const sequence = String(data)
        .padStart(6, "0");

    return `${prefix}-${sequence}`;
}  

/* ==========================================================================
   CREATE
   ========================================================================== */

export async function createProduct({
    barcode = null,
    name,
    description = null,
    category_id,
    brand_id = null,
    cost_price,
    selling_price,
    image_path = null,
}) {

    const sku = await generateProductSku({
        brandId: brand_id,
        productName: name,
    });
    const { data, error } = await supabase
        .from(TABLE)
        .insert({
            sku,
            barcode,
            name,
            description,
            category_id,
            brand_id,
            cost_price,
            selling_price,
            image_path,
        })
        .select()
        .single();

    if (error) throw error;

    return data;
}

/* ==========================================================================
   UPDATE
   ========================================================================== */

export async function updateProduct(
    id,
    {
        barcode = null,
        name,
        description = null,
        category_id,
        brand_id = null,
        cost_price,
        selling_price,
        image_path = null,
        is_active,
    }
) {
    const { data, error } = await supabase
        .from(TABLE)
        .update({
            barcode,
            name,
            description,
            category_id,
            brand_id,
            cost_price,
            selling_price,
            image_path,
            is_active,
        })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;

    return data;
}

/* ==========================================================================
   DELETE (SOFT DELETE)
   ========================================================================== */

export async function deleteProduct(id) {
    const { error } = await supabase
        .from(TABLE)
        .update({
            is_active: false,
        })
        .eq("id", id);

    if (error) throw error;
}

/* ==========================================================================
   STORAGE
   ========================================================================== */

export async function uploadProductImage(file) {
    const filename = generateStorageFilename(file);

    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(filename, file, {
            upsert: false,
        });

    if (error) throw error;

    return filename;
}

export async function deleteProductImage(imagePath) {
    if (!imagePath) {
        return;
    }

    const { error } = await supabase.storage
        .from(BUCKET)
        .remove([imagePath]);

    if (error) throw error;
}

export function getProductImageUrl(imagePath) {
    if (!imagePath) {
        return "/images/no-image.png";
    }

    const { data } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(imagePath);

    return data.publicUrl;
}