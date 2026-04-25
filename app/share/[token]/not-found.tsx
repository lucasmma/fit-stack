export default function ShareNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-default-50 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Link not available</h1>
        <p className="mt-2 text-default-500">
          This share link has been revoked or has expired.
        </p>
      </div>
    </main>
  );
}
