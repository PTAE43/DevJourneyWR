import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      richColors
      toastOptions={{
        classNames: {
          toast: "rounded-xl shadow-lg",
          title: "font-semibold",
          description: "text-muted-foreground",
        },
      }}
      position="top-right"
      {...props} />
  );
}

export { Toaster }
