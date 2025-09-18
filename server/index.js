import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL || "https://qzubdzoggljwpwughvnr.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is not set. The signup endpoint will not work without it.");
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

app.post("/api/signup", async (req, res) => {
  const { fullName, email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing email or password" });
  }

  try {
    // Create a user using the admin (service role) key and mark email as confirmed
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { fullName, role },
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(201).json({ user: data?.user || data });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Signup server listening on port ${PORT}`));
