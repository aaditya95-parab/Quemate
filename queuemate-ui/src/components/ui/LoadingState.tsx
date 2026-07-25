export default function LoadingState({
  label = "Loading...",
}: {
  label?: string;
}) {
  return (
    <section className="loading-state" role="status">
      <span className="spinner" />
      <p>{label}</p>
    </section>
  );
}
