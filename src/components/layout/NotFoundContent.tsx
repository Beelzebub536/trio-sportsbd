import Link from "next/link";

export default function NotFoundContent() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="text-sm text-muted-foreground">
        Error 404
      </p>
      <h1 className="text-4xl font-bold leading-none md:text-6xl">
        Page not found
      </h1>
      <p className="text-sm text-muted-foreground">
        The page you are looking for has moved or no longer exists.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110"
        >
          Go home
        </Link>
        <Link
          href="/shop"
          className="rounded-full border border-input px-5 py-3 text-sm font-semibold hover:bg-secondary"
        >
          Shop all
        </Link>
      </div>
    </div>
  );
}
