import { RedirectToast } from "@/components/redirect-toast"

type TemplateProps = {
  children: React.ReactNode
}

export default function RootTemplate({children}: TemplateProps) {
  return (
    <>
      <>{children}</>
      <RedirectToast />
    </>
  )
}