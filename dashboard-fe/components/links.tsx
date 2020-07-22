import React from "react";
import Link from "next/link";

export const ModuleLink = ({ group, application, module, children }) => (
  <Link
    href={`/applications/${encodeURIComponent(group)}/${encodeURIComponent(
      application
    )}/${encodeURIComponent(module)}`}
  >
    {children}
  </Link>
);

export const ApplicationLink = ({ group, application, children }) => (
  <Link
    href={`/applications/${encodeURIComponent(group)}/${encodeURIComponent(
      application
    )}`}
  >
    {children}
  </Link>
);

export const GroupLink = ({ group, children }) => (
  <Link href={`/applications/${encodeURIComponent(group)}`}>{children}</Link>
);
