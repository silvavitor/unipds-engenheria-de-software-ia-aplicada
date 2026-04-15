import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import SignOutButton from "./sign-out-button";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold text-gray-800">Hello World</h1>

      {session ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg text-gray-600">
            Logado como{" "}
            <span className="font-semibold text-gray-900">
              {session.user.name || session.user.email}
            </span>
          </p>
          {session.user.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt="Avatar"
              className="h-16 w-16 rounded-full border-2 border-gray-200"
            />
          )}
          <SignOutButton />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg text-gray-500">Você não está logado.</p>
          <Link
            href="/login"
            className="rounded-lg bg-gray-900 px-6 py-2 text-white transition hover:bg-gray-700"
          >
            Ir para Login
          </Link>
        </div>
      )}
    </main>
  );
}
