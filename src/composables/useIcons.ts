// Every icon is inlined into the JS bundle as a data URI (`?inline`), so none
// of them is fetched lazily and they all render offline.
const modules = import.meta.glob<string>("/src/assets/svg/*.svg", {
  eager: true,
  query: "?inline",
  import: "default",
});

const icons: Record<string, string> = {};
for (const [path, url] of Object.entries(modules)) {
  const name = path.split("/").pop()!.replace(/\.svg$/, "");
  icons[name] = url;
}

export const getIconUrl = (name: string) => icons[name] ?? "";
