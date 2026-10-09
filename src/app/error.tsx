"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-serif text-4xl">Something went wrong</h1>
      <p className="mt-4 text-taupe">{error.message}</p>
      <button type="button" className="mt-8 uppercase tracking-widest" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
