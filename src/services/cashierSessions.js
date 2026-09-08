import { supabase } from "@/lib/supabase/client";

const CASHIER_SESSIONS_TABLE = "cashier_sessions";

function getDateRange(date) {
  if (!date) {
    throw new Error("Date is required.");
  }

  const startOfDay = new Date(`${date}T00:00:00`);

  const startOfNextDay = new Date(startOfDay);

  startOfNextDay.setDate(startOfNextDay.getDate() + 1);

  return {
    startDate: startOfDay.toISOString(),
    endDate: startOfNextDay.toISOString(),
  };
}

export async function getActiveCashierSession(cashierId) {
  if (!cashierId) {
    throw new Error("Cashier ID is required.");
  }

  const { data, error } = await supabase
    .from(CASHIER_SESSIONS_TABLE)
    .select("*")
    .eq("cashier_id", cashierId)
    .is("time_out", null)
    .order("time_in", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getCashierSessionsForDate({
  cashierId,
  date,
}) {
  if (!cashierId) {
    throw new Error("Cashier ID is required.");
  }

  const {
    startDate,
    endDate,
  } = getDateRange(date);

  const { data, error } = await supabase
    .from(CASHIER_SESSIONS_TABLE)
    .select(`
      id,
      cashier_id,
      time_in,
      time_out
    `)
    .eq("cashier_id", cashierId)
    .gte("time_in", startDate)
    .lt("time_in", endDate)
    .order("time_in", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function startCashierSession(cashierId) {
  if (!cashierId) {
    throw new Error("Cashier ID is required.");
  }

  const activeSession =
    await getActiveCashierSession(cashierId);

  if (activeSession) {
    throw new Error(
      "You already have an active cashier session.",
    );
  }

  const { data, error } = await supabase
    .from(CASHIER_SESSIONS_TABLE)
    .insert({
      cashier_id: cashierId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function endCashierSession(
  sessionId,
  cashierId,
) {
  if (!sessionId) {
    throw new Error("Session ID is required.");
  }

  if (!cashierId) {
    throw new Error("Cashier ID is required.");
  }

  const { data, error } = await supabase
    .from(CASHIER_SESSIONS_TABLE)
    .update({
      time_out: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .eq("cashier_id", cashierId)
    .is("time_out", null)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}