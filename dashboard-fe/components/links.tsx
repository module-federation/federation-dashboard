import React from "react";
import Link from "next/link";

export const ModuleLink = ({ group, application, name }) => (
  <Link href={`/applications/${group}/${application}/${name}`}>
    <a>{name}</a>
  </Link>
);
