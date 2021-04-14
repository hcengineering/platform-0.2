import App from "./App.svelte";
import { render } from "@testing-library/svelte";

test("App", () => {
  const { getByText } = render(App, {
    props: {
      name: "World",
    },
  });

  expect(getByText("Hello World!")).toBeInTheDocument();
});
