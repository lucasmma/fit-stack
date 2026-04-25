"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardBody } from "@heroui/react";
import { z } from "zod";
import { toast } from "sonner";
import { useZodForm } from "@/lib/hooks/use-zod-form";
import { FormRoot } from "@/components/forms/FormRoot";
import { TextField } from "@/components/forms/Field";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { createBrowserClient } from "@/lib/supabase/browser";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginInput = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") ?? "/plans";

  const form = useZodForm({
    schema: loginSchema,
    defaultValues: { email: "", password: "" },
    onSubmit: async (values: LoginInput) => {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) {
        toast.error("Invalid email or password");
        return;
      }
      toast.success("Welcome back");
      router.replace(from);
      router.refresh();
    },
  });

  return (
    <Card shadow="sm">
      <CardBody className="gap-4 p-6">
        <FormRoot form={form} className="flex flex-col gap-4">
          <TextField<LoginInput>
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            autoFocus
            isRequired
          />
          <TextField<LoginInput>
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            isRequired
          />
          <SubmitButton fullWidth>Sign in</SubmitButton>
        </FormRoot>
      </CardBody>
    </Card>
  );
}
