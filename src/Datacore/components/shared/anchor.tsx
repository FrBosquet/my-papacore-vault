import type { Link } from "@blacksmithgu/datacore";
import type { ComponentChildren } from "preact";
import { classMerge } from "../../utils/classMerge";
import { cva } from "./class-variance-authority";

const getVariant = cva({
  base: '[&_a]:no-underline [&_a]:contents [&_a]:font-[weight:inherit] [&_a]:text-inherit',
  variants: {
    default: ''
  },
  sizes: {
    default: ''
  }
})

export type Props = {
  children?: ComponentChildren;
  className?: string;
  tooltip?: string
} & (
    { path: string, link?: never } |
    { path?: never, link: Link }
  )

export const Anchor = ({
  children,
  className,
  path,
  link
}: Props) => {
  const resolvedClassName = classMerge(getVariant(), className);
  const resolvedLink = link ?? dc.fileLink(path);
  const linkAndViz = resolvedLink.withDisplay(children as unknown as string);

  return <div className={resolvedClassName}>
    <dc.Link link={linkAndViz} />
  </div>;
}