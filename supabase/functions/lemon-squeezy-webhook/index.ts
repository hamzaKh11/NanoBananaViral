// - Supabase Edge Function with HMAC Signature Verification
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const LEMON_SQUEEZY_SECRET = Deno.env.get("LEMON_SQUEEZY_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Helper: Verify the signature to prevent hackers from faking payments
const verifySignature = async (req: Request, body: string): Promise<boolean> => {
  const secret = LEMON_SQUEEZY_SECRET;
  const hmac = crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const signature = req.headers.get("X-Signature") || "";
  const signatureBytes = new Uint8Array(
    signature.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );
  
  return await crypto.subtle.verify(
    "HMAC",
    await hmac,
    signatureBytes,
    new TextEncoder().encode(body)
  );
};

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const body = await req.text();
    const isValid = await verifySignature(req, body);

    if (!isValid) {
      console.error("❌ Invalid Signature. Possible attack.");
      return new Response("Invalid Signature", { status: 401 });
    }

    const { meta, data } = JSON.parse(body);
    const eventName = meta.event_name;
    // CRITICAL: We pass user_id in "custom_data" from the frontend
    const userId = meta.custom_data?.user_id; 

    console.log(`🔔 Event: ${eventName} | User: ${userId}`);

    if (!userId) {
        // Sometimes test events don't have user_ids, just ignore them
        return new Response("No User ID found", { status: 200 });
    }

    // 1. HANDLE NEW SUBSCRIPTIONS
    if (eventName === "subscription_created" || eventName === "order_created") {
      const variantId = data.attributes.variant_id;
      let plan = "free";
      let credits = 0;

      // Map Lemon Squeezy Variant IDs to your App Plans
      //
      if (variantId == "00000") { // Replace with ACTUAL Starter Variant ID
        plan = "starter";
        credits = 50;
      } else if (variantId == "e7044c1b-1bca-4d84-8e63-da87c503af09") { // Creator Variant
        plan = "creator";
        credits = 100;
      } else { // Agency/Pro
        plan = "agency";
        credits = 400;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ plan: plan, credits: credits })
        .eq("id", userId);

      if (error) throw error;
    }

    // 2. HANDLE CANCELLATIONS & EXPIRATIONS (The "Optimized" part)
    // If a user cancels or payment fails, downgrade them to free automatically.
    if (eventName === "subscription_cancelled" || eventName === "subscription_expired") {
       const { error } = await supabase
        .from("profiles")
        .update({ plan: "free" })
        .eq("id", userId);
       
       if (error) throw error;
       console.log(`User ${userId} downgraded to free.`);
    }

    return new Response(JSON.stringify({ success: true }), { 
        headers: { "Content-Type": "application/json" } 
    });

  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(`Error: ${err.message}`, { status: 400 });
  }
});