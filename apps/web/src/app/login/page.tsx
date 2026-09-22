import { AuthShell } from '@happi/ui/auth-shell'

export default function LoginPage() {
  return (
    <AuthShell brand={<span>Happi</span>}>
      <div>Auth</div>
    </AuthShell>
  )
}
