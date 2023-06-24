# deployment-restarter

Restarts the pods of a deployment when requested.

## Usage

This app exposes an HTTP endpoint that restarts the deployments matching the given label selector in Kubernetes. The use case is for third-part services, like Gitlab CI or Github Actions, to easily be able to restart pods in a deployment without exposing the entire cluster. Remember that this relies on setting `imagePullPolicy: always` on the pods of your deployments.

### Environment variables

#### PORT

The port to expose the HTTP endpoint on (default: 8080).

#### KEY

The app will check for an `Authentication: Bearer [KEY]` header on the request before executing anything, so preferrably this should be a secret.

#### NAMESPACE

The namespace of the deployments to find, where the app must have permissions to list and patch deployments (service account might be needed).

#### LABEL_SELECTOR

The label selector to match deployments with. For instance "app=mytestapp".

# Development

Install Deno and run:

```sh
deno task dev
```
