// app/(auth)/layout.tsx 생성
export default function AuthLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return <div>{children}</div>
  }