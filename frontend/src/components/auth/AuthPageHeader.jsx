export function AuthPageHeader({ title, description }) {
  return (
    <div className="space-y-2 text-center">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}
