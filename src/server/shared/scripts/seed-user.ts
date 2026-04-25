import { parseArgs } from "node:util";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

async function main() {
  const { values } = parseArgs({
    options: {
      email: { type: "string" },
      password: { type: "string" },
      name: { type: "string" },
    },
  });

  if (!values.email || !values.password) {
    console.error("Usage: npm run seed:user -- --email <email> --password <pass> [--name <name>]");
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error(
      "Missing env: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.",
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const prisma = new PrismaClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email: values.email,
    password: values.password,
    email_confirm: true,
    user_metadata: values.name ? { full_name: values.name } : undefined,
  });

  if (error || !data.user) {
    console.error("Failed to create Supabase auth user:", error?.message);
    process.exit(1);
  }

  await prisma.profile.upsert({
    where: { id: data.user.id },
    create: {
      id: data.user.id,
      email: data.user.email!,
      fullName: values.name ?? null,
    },
    update: { email: data.user.email!, fullName: values.name ?? undefined },
  });

  console.log(`Provisioned ${data.user.email} (${data.user.id})`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
