


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_finance_totals"("p_start_date" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_end_date" timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS TABLE("cash_in" numeric, "cash_out" numeric, "net_cash_flow" numeric)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
    with totals as (
        select
            coalesce(sum(s.total), 0) as cash_in,
            0::numeric as cash_out
        from public.sales s
        where s.status = 'completed'
          and (
              p_start_date is null
              or s.created_at >= p_start_date
          )
          and (
              p_end_date is null
              or s.created_at < p_end_date
          )

        union all

        select
            0::numeric as cash_in,
            coalesce(sum(e.amount), 0) as cash_out
        from public.expenses e
        where (
            p_start_date is null
            or e.created_at >= p_start_date
        )
        and (
            p_end_date is null
            or e.created_at < p_end_date
        )
    )

    select
        coalesce(sum(t.cash_in), 0) as cash_in,
        coalesce(sum(t.cash_out), 0) as cash_out,
        coalesce(sum(t.cash_in), 0)
            - coalesce(sum(t.cash_out), 0)
            as net_cash_flow
    from totals t;
$$;


ALTER FUNCTION "public"."get_finance_totals"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_finance_transaction_count"("p_start_date" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_end_date" timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS bigint
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
    select
        (
            select count(*)
            from public.sales s
            where s.status = 'completed'
              and (
                  p_start_date is null
                  or s.created_at >= p_start_date
              )
              and (
                  p_end_date is null
                  or s.created_at < p_end_date
              )
        )
        +
        (
            select count(*)
            from public.expenses e
            where (
                p_start_date is null
                or e.created_at >= p_start_date
            )
            and (
                p_end_date is null
                or e.created_at < p_end_date
            )
        );
$$;


ALTER FUNCTION "public"."get_finance_transaction_count"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_finance_transactions"("p_start_date" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_end_date" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_page" integer DEFAULT 1, "p_page_size" integer DEFAULT 5) RETURNS TABLE("id" "uuid", "date" timestamp with time zone, "description" "text", "type" "text", "amount" numeric, "source" "text", "reference" "text", "payment_method" "text", "expense_type" "text", "employee_name" "text", "supplier_name" "text", "notes" "text")
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
    with finance_transactions as (

        -- Sales
        select
            s.id,
            s.created_at as date,
            'Sale ' || s.receipt_number as description,
            'CASH_IN'::text as type,
            s.total as amount,
            'SALE'::text as source,
            s.receipt_number as reference,
            s.payment_method,
            null::text as expense_type,
            null::text as employee_name,
            null::text as supplier_name,
            null::text as notes
        from public.sales s
        where s.status = 'completed'
          and (
              p_start_date is null
              or s.created_at >= p_start_date
          )
          and (
              p_end_date is null
              or s.created_at < p_end_date
          )

        union all

        -- Expenses
        select
            e.id,
            e.created_at as date,

            case
                when e.expense_type = 'EMPLOYEE_SALARY'
                    and e.employee_name is not null
                then 'Employee Salary - ' || e.employee_name

                when e.expense_type = 'BUY_FROM_SUPPLIER'
                    and e.supplier_name is not null
                then 'Supplier Purchase - ' || e.supplier_name

                else e.description
            end as description,

            'CASH_OUT'::text as type,
            e.amount,
            'EXPENSE'::text as source,
            e.id::text as reference,
            null::text as payment_method,
            e.expense_type,
            e.employee_name,
            e.supplier_name,
            e.notes
        from public.expenses e
        where (
            p_start_date is null
            or e.created_at >= p_start_date
        )
        and (
            p_end_date is null
            or e.created_at < p_end_date
        )
    )

    select
        ft.id,
        ft.date,
        ft.description,
        ft.type,
        ft.amount,
        ft.source,
        ft.reference,
        ft.payment_method,
        ft.expense_type,
        ft.employee_name,
        ft.supplier_name,
        ft.notes
    from finance_transactions ft
    order by ft.date desc
    limit greatest(p_page_size, 1)
    offset greatest(p_page - 1, 0) * greatest(p_page_size, 1);
$$;


ALTER FUNCTION "public"."get_finance_transactions"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone, "p_page" integer, "p_page_size" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_next_product_sku_number"() RETURNS bigint
    LANGUAGE "sql"
    AS $$
    select nextval('public.product_sku_sequence');
$$;


ALTER FUNCTION "public"."get_next_product_sku_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
    employee_role_id bigint;
begin
    -- Create the application profile
    insert into public.profiles (
        id,
        first_name,
        last_name,
        is_active
    )
    values (
        new.id,
        new.raw_user_meta_data->>'first_name',
        new.raw_user_meta_data->>'last_name',
        true
    );

    -- Find the default Employee role
    select id
    into employee_role_id
    from public.roles
    where name = 'Employee';

    if employee_role_id is null then
        raise exception 'Employee role does not exist';
    end if;

    -- Assign the default Employee role
    insert into public.user_roles (
        user_id,
        role_id
    )
    values (
        new.id,
        employee_role_id
    );

    return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."brands" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."brands" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."expenses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "expense_type" "text" NOT NULL,
    "description" "text" NOT NULL,
    "amount" numeric DEFAULT 0 NOT NULL,
    "employee_name" "text",
    "supplier_name" "text",
    "notes" "text",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "expenses_amount_check" CHECK (("amount" > (0)::numeric)),
    CONSTRAINT "expenses_type_check" CHECK (("expense_type" = ANY (ARRAY['BUY_FROM_SUPPLIER'::"text", 'EMPLOYEE_SALARY'::"text", 'OTHER'::"text"])))
);


ALTER TABLE "public"."expenses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory_item_statuses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text"
);


ALTER TABLE "public"."inventory_item_statuses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "item_code" "text",
    "product_id" "uuid" NOT NULL,
    "supplier_id" "uuid",
    "location_id" "uuid",
    "status_id" "uuid",
    "serial_number" "text",
    "notes" "text",
    "received_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "sold_at" timestamp with time zone
);


ALTER TABLE "public"."inventory_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "inventory_item_id" "uuid" NOT NULL,
    "transaction_type" "text" NOT NULL,
    "from_status_id" "uuid",
    "to_status_id" "uuid",
    "from_location_id" "uuid",
    "to_location_id" "uuid",
    "performed_by" "uuid" NOT NULL,
    "sale_id" "uuid",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "inventory_transactions_type_check" CHECK (("transaction_type" = ANY (ARRAY['RECEIVE'::"text", 'SELL'::"text", 'DAMAGE'::"text", 'ADJUST'::"text", 'MOVE'::"text", 'RETURN'::"text", 'LOST'::"text"])))
);


ALTER TABLE "public"."inventory_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."locations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."locations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."permissions" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."permissions" OWNER TO "postgres";


ALTER TABLE "public"."permissions" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."permissions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE SEQUENCE IF NOT EXISTS "public"."product_sku_sequence"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."product_sku_sequence" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sku" "text",
    "barcode" "text",
    "name" "text" NOT NULL,
    "description" "text",
    "category_id" "uuid",
    "brand_id" "uuid",
    "cost_price" numeric(12,2) DEFAULT 0 NOT NULL,
    "selling_price" numeric(12,2) DEFAULT 0 NOT NULL,
    "image_path" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
    "role_id" bigint NOT NULL,
    "permission_id" bigint NOT NULL,
    "assigned_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."role_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."roles_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."roles_id_seq" OWNED BY "public"."roles"."id";



CREATE TABLE IF NOT EXISTS "public"."sale_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sale_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "quantity" integer NOT NULL,
    "unit_price" numeric(12,2) NOT NULL,
    "cost_price" numeric(12,2) NOT NULL,
    "line_total" numeric(12,2) NOT NULL,
    CONSTRAINT "sale_items_quantity_check" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."sale_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sales" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "receipt_number" "text" NOT NULL,
    "cashier_id" "uuid" NOT NULL,
    "subtotal" numeric(12,2) NOT NULL,
    "total" numeric(12,2) NOT NULL,
    "payment_method" "text" NOT NULL,
    "amount_received" numeric(12,2) NOT NULL,
    "change_given" numeric(12,2) NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text" DEFAULT 'completed'::"text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "customer_name" "text",
    "customer_phone" "text",
    "shipping_address" "text",
    "shipping_method" "text",
    "fulfillment_status" "text",
    CONSTRAINT "sales_fulfillment_status_check" CHECK ((("fulfillment_status" IS NULL) OR ("fulfillment_status" = ANY (ARRAY['PENDING'::"text", 'READY_FOR_PICKUP'::"text", 'PICKED_UP'::"text", 'SHIPPED'::"text", 'DELIVERED'::"text"])))),
    CONSTRAINT "sales_shipping_method_check" CHECK ((("shipping_method" IS NULL) OR ("shipping_method" = ANY (ARRAY['PICKUP'::"text", 'LBC'::"text", 'J&T'::"text"]))))
);


ALTER TABLE "public"."sales" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."suppliers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "contact_person" "text",
    "phone" "text",
    "email" "text",
    "address" "text",
    "notes" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."suppliers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "user_id" "uuid" NOT NULL,
    "role_id" bigint NOT NULL,
    "assigned_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."roles" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."roles_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_item_statuses"
    ADD CONSTRAINT "inventory_item_statuses_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."inventory_item_statuses"
    ADD CONSTRAINT "inventory_item_statuses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_items"
    ADD CONSTRAINT "inventory_items_item_code_key" UNIQUE ("item_code");



ALTER TABLE ONLY "public"."inventory_items"
    ADD CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_transactions"
    ADD CONSTRAINT "inventory_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_sku_key" UNIQUE ("sku");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id", "permission_id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sale_items"
    ADD CONSTRAINT "sale_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sales"
    ADD CONSTRAINT "sales_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sales"
    ADD CONSTRAINT "sales_receipt_number_key" UNIQUE ("receipt_number");



ALTER TABLE ONLY "public"."suppliers"
    ADD CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id", "role_id");



CREATE INDEX "idx_sale_items_product" ON "public"."sale_items" USING "btree" ("product_id");



CREATE INDEX "idx_sale_items_sale" ON "public"."sale_items" USING "btree" ("sale_id");



CREATE INDEX "idx_sales_cashier" ON "public"."sales" USING "btree" ("cashier_id");



CREATE INDEX "idx_sales_created_at" ON "public"."sales" USING "btree" ("created_at");



CREATE INDEX "inventory_transactions_created_at_idx" ON "public"."inventory_transactions" USING "btree" ("created_at");



CREATE INDEX "inventory_transactions_item_idx" ON "public"."inventory_transactions" USING "btree" ("inventory_item_id");



CREATE INDEX "inventory_transactions_performed_by_idx" ON "public"."inventory_transactions" USING "btree" ("performed_by");



CREATE INDEX "inventory_transactions_sale_id_idx" ON "public"."inventory_transactions" USING "btree" ("sale_id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "fk_role_permissions_permission" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "fk_role_permissions_role" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inventory_items"
    ADD CONSTRAINT "inventory_items_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id");



ALTER TABLE ONLY "public"."inventory_items"
    ADD CONSTRAINT "inventory_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."inventory_items"
    ADD CONSTRAINT "inventory_items_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "public"."inventory_item_statuses"("id");



ALTER TABLE ONLY "public"."inventory_items"
    ADD CONSTRAINT "inventory_items_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id");



ALTER TABLE ONLY "public"."inventory_transactions"
    ADD CONSTRAINT "inventory_transactions_from_location_fkey" FOREIGN KEY ("from_location_id") REFERENCES "public"."locations"("id");



ALTER TABLE ONLY "public"."inventory_transactions"
    ADD CONSTRAINT "inventory_transactions_from_status_fkey" FOREIGN KEY ("from_status_id") REFERENCES "public"."inventory_item_statuses"("id");



ALTER TABLE ONLY "public"."inventory_transactions"
    ADD CONSTRAINT "inventory_transactions_item_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id");



ALTER TABLE ONLY "public"."inventory_transactions"
    ADD CONSTRAINT "inventory_transactions_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."inventory_transactions"
    ADD CONSTRAINT "inventory_transactions_sale_fkey" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id");



ALTER TABLE ONLY "public"."inventory_transactions"
    ADD CONSTRAINT "inventory_transactions_to_location_fkey" FOREIGN KEY ("to_location_id") REFERENCES "public"."locations"("id");



ALTER TABLE ONLY "public"."inventory_transactions"
    ADD CONSTRAINT "inventory_transactions_to_status_fkey" FOREIGN KEY ("to_status_id") REFERENCES "public"."inventory_item_statuses"("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sale_items"
    ADD CONSTRAINT "sale_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."sale_items"
    ADD CONSTRAINT "sale_items_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sales"
    ADD CONSTRAINT "sales_cashier_id_fkey" FOREIGN KEY ("cashier_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Authenticated users can insert inventory items" ON "public"."inventory_items" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can read inventory item statuses" ON "public"."inventory_item_statuses" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read inventory items" ON "public"."inventory_items" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can update inventory items" ON "public"."inventory_items" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Users with POS sell permission can create sale items" ON "public"."sale_items" FOR INSERT TO "authenticated" WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."sales" "s"
  WHERE (("s"."id" = "sale_items"."sale_id") AND ("s"."cashier_id" = ( SELECT "auth"."uid"() AS "uid"))))) AND (EXISTS ( SELECT 1
   FROM (("public"."user_roles" "ur"
     JOIN "public"."role_permissions" "rp" ON (("rp"."role_id" = "ur"."role_id")))
     JOIN "public"."permissions" "p" ON (("p"."id" = "rp"."permission_id")))
  WHERE (("ur"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("p"."name" = 'pos.sell'::"text"))))));



CREATE POLICY "Users with POS sell permission can create sales" ON "public"."sales" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM (("public"."user_roles" "ur"
     JOIN "public"."role_permissions" "rp" ON (("rp"."role_id" = "ur"."role_id")))
     JOIN "public"."permissions" "p" ON (("p"."id" = "rp"."permission_id")))
  WHERE (("ur"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("p"."name" = 'pos.sell'::"text")))));



CREATE POLICY "Users with POS sell permission can create sell transactions" ON "public"."inventory_transactions" FOR INSERT TO "authenticated" WITH CHECK ((("transaction_type" = 'SELL'::"text") AND (EXISTS ( SELECT 1
   FROM (("public"."user_roles" "ur"
     JOIN "public"."role_permissions" "rp" ON (("rp"."role_id" = "ur"."role_id")))
     JOIN "public"."permissions" "p" ON (("p"."id" = "rp"."permission_id")))
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("p"."name" = 'pos.sell'::"text"))))));



CREATE POLICY "Users with finance expense permission can create expenses" ON "public"."expenses" FOR INSERT TO "authenticated" WITH CHECK ((("created_by" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM (("public"."user_roles" "ur"
     JOIN "public"."role_permissions" "rp" ON (("rp"."role_id" = "ur"."role_id")))
     JOIN "public"."permissions" "p" ON (("p"."id" = "rp"."permission_id")))
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("p"."name" = 'finance.expense.create'::"text"))))));



CREATE POLICY "Users with finance read permission can view expenses" ON "public"."expenses" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM (("public"."user_roles" "ur"
     JOIN "public"."role_permissions" "rp" ON (("rp"."role_id" = "ur"."role_id")))
     JOIN "public"."permissions" "p" ON (("p"."id" = "rp"."permission_id")))
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("p"."name" = 'finance.read'::"text")))));



CREATE POLICY "Users with inventory damage permission can create transactions" ON "public"."inventory_transactions" FOR INSERT TO "authenticated" WITH CHECK ((("transaction_type" = 'DAMAGE'::"text") AND (EXISTS ( SELECT 1
   FROM (("public"."user_roles" "ur"
     JOIN "public"."role_permissions" "rp" ON (("rp"."role_id" = "ur"."role_id")))
     JOIN "public"."permissions" "p" ON (("p"."id" = "rp"."permission_id")))
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("p"."name" = 'inventory.damage'::"text"))))));



CREATE POLICY "Users with inventory read permission can view transactions" ON "public"."inventory_transactions" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM (("public"."user_roles" "ur"
     JOIN "public"."role_permissions" "rp" ON (("rp"."role_id" = "ur"."role_id")))
     JOIN "public"."permissions" "p" ON (("p"."id" = "rp"."permission_id")))
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("p"."name" = 'inventory.read'::"text")))));



CREATE POLICY "Users with inventory receive permission can create transactions" ON "public"."inventory_transactions" FOR INSERT TO "authenticated" WITH CHECK ((("transaction_type" = 'RECEIVE'::"text") AND (EXISTS ( SELECT 1
   FROM (("public"."user_roles" "ur"
     JOIN "public"."role_permissions" "rp" ON (("rp"."role_id" = "ur"."role_id")))
     JOIN "public"."permissions" "p" ON (("p"."id" = "rp"."permission_id")))
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("p"."name" = 'inventory.receive'::"text"))))));



CREATE POLICY "Users with sales fulfillment permission can update fulfillment" ON "public"."sales" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM (("public"."user_roles" "ur"
     JOIN "public"."role_permissions" "rp" ON (("rp"."role_id" = "ur"."role_id")))
     JOIN "public"."permissions" "p" ON (("p"."id" = "rp"."permission_id")))
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("p"."name" = 'sales.fulfillment'::"text"))))) WITH CHECK (("fulfillment_status" = ANY (ARRAY['PENDING'::"text", 'READY_FOR_PICKUP'::"text", 'PICKED_UP'::"text", 'SHIPPED'::"text", 'DELIVERED'::"text"])));



CREATE POLICY "Users with sales read permission can view sale items" ON "public"."sale_items" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM (("public"."user_roles" "ur"
     JOIN "public"."role_permissions" "rp" ON (("rp"."role_id" = "ur"."role_id")))
     JOIN "public"."permissions" "p" ON (("p"."id" = "rp"."permission_id")))
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("p"."name" = 'sales.read'::"text")))));



CREATE POLICY "Users with sales read permission can view sales" ON "public"."sales" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM (("public"."user_roles" "ur"
     JOIN "public"."role_permissions" "rp" ON (("rp"."role_id" = "ur"."role_id")))
     JOIN "public"."permissions" "p" ON (("p"."id" = "rp"."permission_id")))
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("p"."name" = 'sales.read'::"text")))));



ALTER TABLE "public"."expenses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inventory_item_statuses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inventory_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inventory_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sale_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sales" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."get_finance_totals"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_finance_totals"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_finance_totals"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_finance_transaction_count"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_finance_transaction_count"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_finance_transaction_count"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_finance_transactions"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone, "p_page" integer, "p_page_size" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_finance_transactions"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone, "p_page" integer, "p_page_size" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_finance_transactions"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone, "p_page" integer, "p_page_size" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_next_product_sku_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_next_product_sku_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_next_product_sku_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";


















GRANT ALL ON TABLE "public"."brands" TO "anon";
GRANT ALL ON TABLE "public"."brands" TO "authenticated";
GRANT ALL ON TABLE "public"."brands" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."expenses" TO "anon";
GRANT ALL ON TABLE "public"."expenses" TO "authenticated";
GRANT ALL ON TABLE "public"."expenses" TO "service_role";



GRANT ALL ON TABLE "public"."inventory_item_statuses" TO "anon";
GRANT ALL ON TABLE "public"."inventory_item_statuses" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_item_statuses" TO "service_role";



GRANT ALL ON TABLE "public"."inventory_items" TO "anon";
GRANT ALL ON TABLE "public"."inventory_items" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_items" TO "service_role";



GRANT ALL ON TABLE "public"."inventory_transactions" TO "anon";
GRANT ALL ON TABLE "public"."inventory_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."locations" TO "anon";
GRANT ALL ON TABLE "public"."locations" TO "authenticated";
GRANT ALL ON TABLE "public"."locations" TO "service_role";



GRANT ALL ON TABLE "public"."permissions" TO "anon";
GRANT ALL ON TABLE "public"."permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."permissions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."permissions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."permissions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."permissions_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."product_sku_sequence" TO "anon";
GRANT ALL ON SEQUENCE "public"."product_sku_sequence" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."product_sku_sequence" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."role_permissions" TO "anon";
GRANT ALL ON TABLE "public"."role_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."role_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."roles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."sale_items" TO "anon";
GRANT ALL ON TABLE "public"."sale_items" TO "authenticated";
GRANT ALL ON TABLE "public"."sale_items" TO "service_role";



GRANT ALL ON TABLE "public"."sales" TO "anon";
GRANT ALL ON TABLE "public"."sales" TO "authenticated";
GRANT ALL ON TABLE "public"."sales" TO "service_role";



GRANT ALL ON TABLE "public"."suppliers" TO "anon";
GRANT ALL ON TABLE "public"."suppliers" TO "authenticated";
GRANT ALL ON TABLE "public"."suppliers" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































