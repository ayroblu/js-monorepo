import { Action, ActionPanel, List } from "@raycast/api";

export default function Command() {
  return <Main />;
}
function Main() {
  return (
    <List throttle>
      <SearchList />
    </List>
  );
}
function SearchList() {
  return (
    <List.Item
      key="key"
      title="title"
      subtitle="subtitle"
      actions={
        <ActionPanel title="title action">
          <Action title="action title" onAction={() => {}} />
        </ActionPanel>
      }
    />
  );
}
