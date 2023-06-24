import {
  AppsV1Api,
  STATUS_TEXT,
  Status,
  autoDetectClient,
  serve,
} from "./deps.ts";

const port = Number(Deno.env.get("PORT") ?? 8080);
const key = Deno.env.get("KEY");
const namespace = Deno.env.get("NAMESPACE");
const labelSelector = Deno.env.get("LABEL_SELECTOR");

if (!key) {
  throw new Error("No KEY env var set");
}

if (!namespace) {
  throw new Error("No NAMESPACE env var set");
}

if (!labelSelector) {
  throw new Error("No LABEL_SELECTOR env var set");
}

console.log("Config:", { port, key, namespace, labelSelector });

const kubernetes = await autoDetectClient();
const appsApi = new AppsV1Api(kubernetes);

// Set up HTTP handler
const handler = async (request: Request) => {
  const headerKey = request.headers
    .get("authorization")
    ?.replace(/bearer\s*/i, "");

  if (request.method !== "POST") {
    return response(Status.MethodNotAllowed);
  }
  if (!headerKey) {
    return response(Status.Unauthorized);
  }
  if (headerKey !== key) {
    return response(Status.Forbidden);
  }

  const deployments = await appsApi
    .namespace(namespace)
    .getDeploymentList({ labelSelector });

  for (const deployment of deployments.items) {
    const name = deployment.metadata?.name;
    if (!name) {
      continue;
    }
    console.log("Restarting deployment", deployment.metadata?.name);
    const res = await appsApi
      .namespace(namespace)
      .patchDeployment(name, "strategic-merge", {
        spec: {
          selector: {},
          template: {
            metadata: {
              annotations: {
                "kubectl.kubernetes.io/restartedAt": new Date().toISOString(),
              },
            },
          },
        },
      });
    console.log("Restarted:", res.metadata?.name);
  }

  console.log(
    "Restarted",
    deployments.items.length,
    "deployments:",
    deployments.items.map((i) => i.metadata?.name)
  );

  return new Response("Ok: " + deployments.items.length, {
    status: 200,
    statusText: "Ok",
  });
};

await serve(handler, { port });

function response(status: Status) {
  return new Response(STATUS_TEXT[status], {
    status,
    statusText: STATUS_TEXT[status],
  });
}
