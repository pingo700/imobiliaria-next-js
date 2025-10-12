import LoginClient from './LoginClient'

export default function Page({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const nextParam =
    typeof searchParams.next === 'string' && searchParams.next ? searchParams.next : '/admin'
  return <LoginClient nextParam={nextParam} />
}
