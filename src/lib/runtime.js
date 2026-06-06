const api = globalThis.browser ?? globalThis.chrome;

function callPermissionsApi(methodName, details) {
  const method = api.permissions?.[methodName];
  if (!method) {
    return Promise.resolve(false);
  }

  if (method.length <= 1) {
    return method(details);
  }

  return new Promise((resolve, reject) => {
    method(details, (result) => {
      if (api.runtime.lastError) {
        reject(new Error(api.runtime.lastError.message));
        return;
      }
      resolve(Boolean(result));
    });
  });
}

export function sendMessage(message) {
  if (api.runtime.sendMessage.length <= 1) {
    return api.runtime.sendMessage(message);
  }

  return new Promise((resolve, reject) => {
    api.runtime.sendMessage(message, (response) => {
      if (api.runtime.lastError) {
        reject(new Error(api.runtime.lastError.message));
        return;
      }
      resolve(response);
    });
  });
}

export function containsPermissions(permissions) {
  return containsPermissionDetails({ permissions });
}

export function requestPermissions(permissions) {
  return requestPermissionDetails({ permissions });
}

export function removePermissions(permissions) {
  return removePermissionDetails({ permissions });
}

export function containsPermissionDetails(details) {
  return callPermissionsApi("contains", details);
}

export function requestPermissionDetails(details) {
  return callPermissionsApi("request", details);
}

export function removePermissionDetails(details) {
  return callPermissionsApi("remove", details);
}
