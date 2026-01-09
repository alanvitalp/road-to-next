import { Separator } from "./ui/separator";

interface HeadingProps {
  title: string;
  description?: string;
  breadcrumbs?: React.ReactNode;
  tabs?: React.ReactNode;
  actions?: React.ReactNode;
}

const Heading = ({
  title,
  description,
  breadcrumbs,
  tabs,
  actions,
}: HeadingProps) => {
  return (
    <div className="space-y-4">
      {breadcrumbs && <div className="px-8">{breadcrumbs}</div>}

      {tabs && <div className="px-8">{tabs}</div>}

      <div className="flex items-center justify-between px-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex gap-x-2">{actions}</div>}
      </div>

      <Separator />
    </div>
  );
};

export { Heading };
