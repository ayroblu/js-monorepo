import { useLayoutEffect } from "react";

export function SuspenseLoading({
  setIsLoading,
}: {
  setIsLoading: (isLoading: boolean) => void;
}) {
  useLayoutEffect(() => {
    setIsLoading(true);
    return () => {
      setIsLoading(false);
    };
  }, [setIsLoading]);
  return null;
}
