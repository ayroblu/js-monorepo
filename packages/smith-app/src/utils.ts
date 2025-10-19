export const cn = (
  ...args: (string | undefined | null | false | 0 | "")[]
): string => {
  return args.filter((arg) => arg).join(" ");
};
