// https://drash.land/docs/#/introduction#quickstart

import Drash from "https://deno.land/x/drash@v0.39.5/mod.ts";

class HomeResource extends Drash.Http.Resource {
  static paths = ["/"];
  public GET() {
    this.response.body = "Hello World!";
    return this.response;
  }
}

const server = new Drash.Http.Server({
  address: "localhost:1447",
  response_output: "text/html",
  resources: [HomeResource],
});

server.run();
