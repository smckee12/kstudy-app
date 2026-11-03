"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Stars or un-stars one card. `starred` is what it should be after the click.
export async function setStar(cardId: number, starred: boolean): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = starred
    ? // user_id fills itself in (default auth.uid()). If it's already
      // starred, ignoreDuplicates makes this a no-op instead of an error.
      await supabase
        .from("stars")
        .upsert({ card_id: cardId }, { onConflict: "user_id,card_id", ignoreDuplicates: true })
    : await supabase.from("stars").delete().eq("card_id", cardId);

  if (error) return { error: `Couldn't update the star: ${error.message}` };

  revalidatePath("/", "layout");
  return {};
}
