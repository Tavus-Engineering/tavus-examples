import { DailyProvider } from "@daily-co/daily-react";

export const CVIProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <DailyProvider>
      {children}
    </DailyProvider>
  )
}
