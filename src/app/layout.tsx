// app/layout.tsx 파일 생성 (없다면)
export default function RootLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <html lang="ko">
        <body>{children}</body>
      </html>
    )
  }