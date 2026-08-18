import { Input } from '../ui/Input.jsx';

export function AuthField({ label, error, id, ...inputProps }) {
  return (
    <label className="block space-y-1.5" htmlFor={id}>
      <span className="text-sm font-medium text-foreground">{label}</span>
      <Input id={id} error={error} {...inputProps} />
    </label>
  );
}
