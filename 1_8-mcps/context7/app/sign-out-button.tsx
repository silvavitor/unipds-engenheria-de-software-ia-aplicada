"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/login"),
      },
    });
  };

  return (
    <button
      onClick={handleSignOut}
      className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition hover:bg-gray-100"
    >
      Sair
    </button>
  );
}
