import Drash from "https://deno.land/x/drash@v0.39.5/mod.ts";
import { TodoListResource, TodoItemResource } from "./todo.ts";

const server = new Drash.Http.Server({
  address: "localhost:1447",
  response_output: "text/html",
  resources: [TodoListResource, TodoItemResource],
  logger: new Drash.CoreLoggers.ConsoleLogger({
    enabled: true,
    level: "all",
    tag_string: "{datetime} | {level} |",
    tag_string_fns: {
      datetime() {
        return new Date().toISOString().replace("T", " ");
      },
    },
  }),
});

server.run();
