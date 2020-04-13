<!-- This is slightly modified example made by the vue.js team. -->
<!-- Source code: https://github.com/vuejs/vuejs.org/blob/master/src/v2/examples/vue-20-todomvc/index.html -->
<!-- Copyright (c) 2013-present Yuxi Evan You -->
<!DOCTYPE html>
<html>
  <head>
    <title>ParisDeno 2020</title>
    <script src="https://unpkg.com/vue"></script>
    <link
      rel="stylesheet"
      type="text/css"
      href="https://unpkg.com/todomvc-app-css@2.2.0/index.css"
    />
    <style>
[v-cloak] {
  display: none;
}
</style>
  </head>
  <body>
    <section class="todoapp">
      <header class="header">
        <h1>todos</h1>
        <input
          class="new-todo"
          autofocus
          autocomplete="off"
          placeholder="What needs to be done?"
          v-model="newTodo"
          @keyup.enter="addTodo"
        />
      </header>
      <section class="main" v-show="todos.length" v-cloak>
        <input
          id="toggle-all"
          class="toggle-all"
          type="checkbox"
          v-model="allDone"
        />
        <label for="toggle-all"></label>
        <ul class="todo-list">
          <li
            v-for="todo in filteredTodos"
            class="todo"
            :key="todo.id"
            :class="{ completed: todo.completed, editing: todo == editedTodo }"
          >
            <div class="view">
              <input
                class="toggle"
                type="checkbox"
                v-model="todo.completed"
                @click="editTodo(todo)"
              />
              <label @dblclick="editTodo(todo)">{{ todo.title }}</label>
              <button class="destroy" @click="removeTodo(todo)"></button>
            </div>
            <input
              class="edit"
              type="text"
              v-model="todo.title"
              v-todo-focus="todo == editedTodo"
              @blur="doneEdit(todo)"
              @keyup.enter="doneEdit(todo)"
              @keyup.esc="cancelEdit(todo)"
            />
          </li>
        </ul>
      </section>
      <footer class="footer" v-show="todos.length" v-cloak>
        <span class="todo-count">
          <strong>{{ remaining }}</strong> {{ remaining | pluralize }} left
        </span>
        <ul class="filters">
          <li>
            <a href="#/all" :class="{ selected: visibility == 'all' }">All</a>
          </li>
          <li>
            <a href="#/active" :class="{ selected: visibility == 'active' }"
              >Active</a
            >
          </li>
          <li>
            <a
              href="#/completed"
              :class="{ selected: visibility == 'completed' }"
              >Completed</a
            >
          </li>
        </ul>
        <button
          class="clear-completed"
          @click="removeCompleted"
          v-show="todos.length > remaining"
        >
          Clear completed
        </button>
      </footer>
    </section>
    <footer class="info">
      <p>Double-click to edit a todo</p>
      <p>Written by <a href="http://evanyou.me">Evan You</a></p>
      <p>Modified for ParisDeno2020 by Michal Sabiniarz.</p>
      <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
    </footer>

    <script>
// Full spec-compliant TodoMVC with localStorage persistence
// and hash-based routing in ~120 effective lines of JavaScript.

// localStorage persistence
var STORAGE_KEY = "todos-vuejs-2.0";

let tmpuid = 0;

var todoApi = {
  fetch: async function() {
    var headers = new Headers();
    headers.set("Response-Content-Type", "application/json");
    var todos = await (
      await fetch("http://localhost:1447/todos", { headers })
    ).json();
    var parsed = JSON.parse(todos);
    return parsed;
  },
  save: async function(todo) {
    let headers = new Headers();
    headers.set("Content-Type", "application/json");
    const response = await fetch("http://localhost:1447/todos/", {
      method: "POST",
      body: JSON.stringify({
        title: todo.title,
        completed: todo.completed
      }),
      headers
    });
    const t = await response.json();
    return t;
  },
  update: async function(todo) {
    let headers = new Headers();
    headers.set("Content-Type", "application/json");
    const response = await fetch(`http://localhost:1447/todos/${todo.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: todo.title,
        completed: todo.completed
      }),
      headers
    });
    const t = await response.json();
    return t;
  },
  delete: async function(todo) {
    let headers = new Headers();
    headers.set("Content-Type", "application/json");
    const response = await fetch(`http://localhost:1447/todos/${todo.id}`, {
      method: "DELETE",
      body: JSON.stringify({
        title: todo.title,
        completed: todo.completed
      }),
      headers
    });
    const t = await response.json();
    return t;
  }
};

// visibility filters
var filters = {
  all: function(todos) {
    return todos;
  },
  active: function(todos) {
    return todos.filter(function(todo) {
      return !todo.completed;
    });
  },
  completed: function(todos) {
    return todos.filter(function(todo) {
      return todo.completed;
    });
  }
};

// app Vue instance
var app = new Vue({
  // app initial state
  data: {
    todos: [],
    newTodo: "",
    editedTodo: null,
    visibility: "all"
  },

  mounted() {
    todoApi.fetch().then(todos => (this.todos = todos));
  },

  // computed properties
  // http://vuejs.org/guide/computed.html
  computed: {
    filteredTodos: function() {
      return filters[this.visibility](this.todos);
    },
    remaining: function() {
      return filters.active(this.todos).length;
    },
    allDone: {
      get: function() {
        return this.remaining === 0;
      },
      set: function(value) {
        this.todos.forEach(function(todo) {
          todo.completed = value;
        });
      }
    }
  },

  filters: {
    pluralize: function(n) {
      return n === 1 ? "item" : "items";
    }
  },

  // methods that implement data logic.
  // note there's no DOM manipulation here at all.
  methods: {
    addTodo: function() {
      var value = this.newTodo && this.newTodo.trim();
      if (!value) {
        return;
      }
      var todo = {
        id: tmpuid++,
        title: value,
        completed: false
      };
      this.todos.push(todo);
      todoApi.save(todo).then(t => {
        todo.id = t.id;
      });
      this.newTodo = "";
    },

    removeTodo: function(todo) {
      todoApi.delete(todo);
      this.todos.splice(this.todos.indexOf(todo), 1);
    },

    editTodo: function(todo) {
      this.beforeEditCache = todo.title;
      this.editedTodo = todo;
    },

    doneEdit: function(todo) {
      if (!this.editedTodo) {
        return;
      }
      this.editedTodo = null;
      todo.title = todo.title.trim();
      if (!todo.title) {
        this.removeTodo(todo);
      } else {
        todoApi.update(todo);
      }
    },

    cancelEdit: function(todo) {
      this.editedTodo = null;
      todo.title = this.beforeEditCache;
    },

    removeCompleted: function() {
      this.todos = filters.active(this.todos);
    }
  },

  // a custom directive to wait for the DOM to be updated
  // before focusing on the input field.
  // http://vuejs.org/guide/custom-directive.html
  directives: {
    "todo-focus": function(el, binding) {
      if (binding.value) {
        el.focus();
      }
    }
  }
});

// handle routing
function onHashChange() {
  var visibility = window.location.hash.replace(/#\/?/, "");
  if (filters[visibility]) {
    app.visibility = visibility;
  } else {
    window.location.hash = "";
    app.visibility = "all";
  }
}

window.addEventListener("hashchange", onHashChange);
onHashChange();

// mount
app.$mount(".todoapp");
</script>
  </body>
</html>
