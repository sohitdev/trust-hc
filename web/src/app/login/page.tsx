import { login } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Storefront } from "@phosphor-icons/react/dist/ssr"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const resolvedParams = await searchParams;
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-zinc-200 rounded-xl shadow-sm p-8">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-zinc-950 rounded-xl flex items-center justify-center text-emerald-400">
            <Storefront weight="fill" className="w-7 h-7" />
          </div>
        </div>
        
        <h1 className="text-2xl font-semibold tracking-tight text-center mb-2 text-zinc-900">
          Trust Health.care
        </h1>
        <p className="text-zinc-500 text-sm text-center mb-8">
          Enter admin credentials to continue
        </p>

        <form action={login} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="admin@trusthealth.care" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          
          {resolvedParams?.message && (
            <div className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-md text-center">
              {resolvedParams.message}
            </div>
          )}

          <Button type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800 text-white mt-4">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  )
}
