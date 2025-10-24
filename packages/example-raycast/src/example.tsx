import { shell } from "@ayroblu/shell-utils";
import { searchStringFn } from "@ayroblu/utils";
import { Action, ActionPanel, Detail, environment, List } from "@raycast/api";
import { atom, useAtomValue } from "jotai";
import { Suspense, useState } from "react";
import { SuspenseLoading } from "./helpers.tsx";

export default function Command() {
  return <Main />;
}
function Main() {
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  return (
    <List onSearchTextChange={setSearch} isLoading={isLoading}>
      <Suspense fallback={<SuspenseLoading setIsLoading={setIsLoading} />}>
        <SearchList search={search} />
      </Suspense>
    </List>
  );
}

function SearchList({ search }: { search: string }) {
  const cwd = useAtomValue(cwdAtom);
  const path = useAtomValue(pathAtom);
  const compilePath = process.env.PATH;
  const nodePath = useAtomValue(nodePathAtom);
  const items = [
    { title: "cwd", subtitle: cwd },
    { title: "path", subtitle: path },
    { title: "compile PATH", subtitle: compilePath ?? "" },
    { title: "type -a node", subtitle: nodePath },
    { title: "environment.supportPath", subtitle: environment.supportPath },
    { title: "environment.assetsPath", subtitle: environment.assetsPath },
  ];
  const searchString = searchStringFn(search);
  return (
    <>
      {items
        .filter(({ title, subtitle }) => {
          return searchString(title) || searchString(subtitle);
        })
        .map(({ title, subtitle }) => (
          <List.Item
            key={title}
            title={title}
            subtitle={subtitle}
            actions={
              <ActionPanel title={title}>
                <Action.Push
                  title="View details"
                  target={<DetailsItem title={title} subtitle={subtitle} />}
                />
              </ActionPanel>
            }
          />
        ))}
    </>
  );
}
type DetailsItemProps = { title: string; subtitle: string | undefined };
function DetailsItem({ title, subtitle }: DetailsItemProps) {
  return <Detail markdown={`# ${title}\n### ${subtitle}`} />;
}

const cwdAtom = atom(async () => {
  const { stdout } = await shell("pwd");
  return stdout.trim();
});
const pathAtom = atom(async () => {
  const { stdout } = await shell("echo $PATH");
  return stdout.trim();
});
const nodePathAtom = atom(async () => {
  const { stdout } = await shell("type -a node || echo 'node not found'");
  return stdout.trim();
});
