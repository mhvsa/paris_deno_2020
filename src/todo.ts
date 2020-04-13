import Drash from "https://deno.land/x/drash@v0.39.5/mod.ts";
import { v4 } from "https://deno.land/std@v0.39.0/uuid/mod.ts";
import { decode } from "https://deno.land/std@v0.39.0/encoding/utf8.ts";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

// our "database"
let todos: Todo[] = [
  {
    id: v4.generate(),
    title: "Hello, ParisDeno!",
    completed: false,
  },
];

export class TodoItemResource extends Drash.Http.Resource {
  static paths = ["/todos/:id"];

  public PATCH() {
    const id = this.request.getPathParam("id");
    const todo = this.updateTodo(id);
    this.response.body = JSON.stringify(todo);
    return this.response;
  }

  public DELETE() {
    const id = this.request.getPathParam("id");
    const todo = this.deleteTodo(id);
    this.response.body = JSON.stringify(todo);
    return this.response;
  }

  protected updateTodo(id: string): Todo {
    const todo = todos.find((todo) => todo.id === id);
    if (!todo) {
      throw new Drash.Exceptions.HttpException(
        404,
        `Todo with id ${id} not found`
      );
    }
    const title = this.request.getBodyParam("title");
    const completed = this.request.getBodyParam("completed");
    if (!title && completed === undefined) {
      throw new Drash.Exceptions.HttpException(
        400,
        "Title or completed are required for todo update"
      );
    }
    if (title) {
      todo.title = title;
    }
    if (completed !== undefined) {
      todo.completed = completed;
    }
    return todo;
  }

  protected deleteTodo(id: string): Todo {
    const todo = todos.find((todo) => todo.id === id);
    if (!todo) {
      throw new Drash.Exceptions.HttpException(
        404,
        `Todo with id ${id} not found`
      );
    }
    todos = todos.filter((todo) => todo.id !== id);
    return todo;
  }
}

export class TodoListResource extends Drash.Http.Resource {
  static paths = ["/todos"];

  public async GET() {
    switch (this.request.response_content_type) {
      case "application/json":
        this.response.body = this.getAllTodos();
        break;
      case "text/html":
      default:
        this.response.body = await this.renderView();
        break;
    }
    return this.response;
  }

  public POST() {
    const title = this.request.getBodyParam("title");
    const completed = this.request.getBodyParam("completed");
    const todo = this.createTodo(title, completed);
    this.response.body = JSON.stringify(todo);
    this.response.status_code = 201;
    return this.response;
  }

  protected getAllTodos(): any {
    return JSON.stringify(todos);
  }

  protected createTodo(title: any, completed: any) {
    if (!title || completed === undefined) {
      throw new Drash.Exceptions.HttpException(
        400,
        "title and completed body params are required"
      );
    }
    const todo = {
      id: v4.generate(),
      title,
      completed,
    };
    todos.push(todo);
    return todo;
  }

  protected async renderView() {
    return decode(await Deno.readFile("./src/todo.vue"));
  }
}
