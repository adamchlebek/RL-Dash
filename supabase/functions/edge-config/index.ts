import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  action: "get" | "set";
  key: string;
  value?: { value: boolean };
}

interface EdgeConfig {
  key: string;
  value: { value: boolean };
}

serve(async (req: Request) => {
  console.log("Request received:", req.method, req.url);
  
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log("Environment check:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey
    });

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    const body: RequestBody = await req.json();
    console.log("Request body:", body);

    if (!body.action || !body.key) {
      throw new Error("Missing required fields: action and key");
    }

    if (body.action === "get") {
      console.log("Getting config for key:", body.key);
      const { data, error } = await supabaseClient
        .from("EdgeConfig")
        .select("value")
        .eq("key", body.key)
        .single();

      if (error) {
        console.error("Get error:", error);
        throw error;
      }

      const response: EdgeConfig = data ?? { key: body.key, value: { value: true } };
      console.log("Get response:", response);
      return new Response(JSON.stringify(response.value), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.action === "set") {
      if (!body.value) {
        throw new Error("Missing value for set action");
      }

      console.log("Setting config for key:", body.key, "value:", body.value);
      const { error } = await supabaseClient
        .from("EdgeConfig")
        .upsert({ key: body.key, value: body.value }, { onConflict: "key" });

      if (error) {
        console.error("Set error:", error);
        throw error;
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid action");
  } catch (error) {
    console.error("Edge Function Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }), 
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}); 