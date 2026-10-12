export default function StatusMessage({ title, description, children }) {
  return (
    <section className="mx-auto max-w-xl rounded-[2rem] border border-line bg-card px-8 py-16 text-center shadow-sm">
      <h1 className="font-display text-4xl text-ink">{title}</h1>
      {description ? <p className="mx-auto mt-4 max-w-md text-muted">{description}</p> : null}
      {children ? <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div> : null}
    </section>
  );
}
