import { supabase } from '../../../assets/js/auth.js';
console.log("MyNet Admin Dashboard connected to Supabase!");

async function checkAdmin() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error("Auth error:", error.message);
    return;
  }

  if (!user) {
    console.log("No admin logged in yet.");
    return;
  }

  console.log("Logged-in account:", user.email);
}

checkAdmin();
console.log("ADMIN SCRIPT.JS FILE LOADED");