using Workerd = import "/workerd/workerd.capnp";

const helloConfig :Workerd.Config = (
 services = [
   ( name = "hello-worker", worker = .helloWorker )
 ],
 sockets = [
   ( name = "hello-socket", address = "*:8080", http = (), service = "hello-worker" )
 ]
);

const helloWorker :Workerd.Worker = (
 modules = [
   ( name = "worker.mjs",
     esModule =
       `export default {
       `  async fetch(request, env, ctx) {
       `    return new Response("Hello from workerd! 👋");
       `  }
       `}
   )
 ],
 compatibilityDate = "2023-04-04",
);
