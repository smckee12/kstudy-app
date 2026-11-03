"use server";

import { createClient } from "@/lib/supabase/server";

// Saves one answer from study mode: correct = true for "Got it",
// false for "Missed it". user_id and reviewed_at fill themselves in.
export async function saveReview(cardId: number, correct: boolean): Promise<{ error?: string }> {
  // Anyone can call a Server Action with any values, so check them.
  if (!Number.isInteger(cardId) || typeof correct !== "boolean") {
    return { error: "That answer couldn't be saved." };
  }

  const supabase = await createClient();
  // Row-level security only lets me review my own cards.
  const { error } = await supabase.from("reviews").insert({ card_id: cardId, correct });

  if (error) {
    // The technical details go to the server log; I see a plain message.
    console.error("saveReview failed:", error.message);
    return { error: "Couldn't save your answer." };
  }

  // No revalidatePath here on purpose: re-rendering the study page would
  // shuffle the cards again in the middle of a session. Other pages (like
  // the dashboard) always load fresh, so they'll see the new review.
  return {};
}
