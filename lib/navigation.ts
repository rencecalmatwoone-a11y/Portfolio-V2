export function navigationHref(pathname: string, id: string) {
  return `${pathname === "/" ? "" : "/"}#${id}`;
}
