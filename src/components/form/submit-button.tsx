import { LucideLoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";

const SubmitButton = ({ label }: { label: string }) => {
  const { pending } = useFormStatus();

  return (
    <Button type="submit">
      { pending && (
        <>
          <LucideLoaderCircle className="h-4 w-4 animate-spin" />
        </>
      )}
      { label } 
    </Button>
  )
}

export { SubmitButton }