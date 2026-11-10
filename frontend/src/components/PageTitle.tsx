import type { ReactNode } from "react";

type PageTitleProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export default function PageTitle({
  title,
  subtitle,
  actions,
}: PageTitleProps) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="page-heading-actions">{actions}</div>}
    </div>
  );
}
