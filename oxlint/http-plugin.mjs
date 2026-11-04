function findVariable(node, context) {
  for (
    let scope = context.sourceCode.getScope(node);
    scope;
    scope = scope.upper
  ) {
    const variable = scope.set.get(node.name);

    if (variable) {
      return variable;
    }
  }
}

function isGlobal(node, names, context) {
  return (
    node?.type === "Identifier" &&
    names.includes(node.name) &&
    !findVariable(node, context)?.defs.length
  );
}

function propertyName(node) {
  return node.computed ? node.property.value : node.property.name;
}

function unwrap(node) {
  let expression = node;

  while (
    expression &&
    [
      "AwaitExpression",
      "ChainExpression",
      "TSAsExpression",
      "TSNonNullExpression",
      "TSSatisfiesExpression",
      "TSTypeAssertion",
    ].includes(expression.type)
  ) {
    expression = expression.argument ?? expression.expression;
  }

  return expression;
}

function isFetchCall(node, context) {
  const call = unwrap(node);

  if (call?.type !== "CallExpression") {
    return false;
  }

  const callee = unwrap(call.callee);

  return (
    isGlobal(callee, ["fetch"], context) ||
    (callee.type === "MemberExpression" &&
      propertyName(callee) === "fetch" &&
      isGlobal(
        callee.object,
        ["globalThis", "window", "self", "global"],
        context
      ))
  );
}

function isTryCatchCall(node, context) {
  const callee = unwrap(node.callee);

  const identifier =
    callee.type === "MemberExpression" ? callee.object : callee;

  if (identifier.type !== "Identifier") {
    return false;
  }

  const [definition] = findVariable(identifier, context)?.defs ?? [];

  if (
    definition?.type !== "ImportBinding" ||
    definition.parent.source.value !== "@/utils/try-catch"
  ) {
    return false;
  }

  return callee.type === "Identifier"
    ? definition.node.type === "ImportSpecifier" &&
        (definition.node.imported.name ?? definition.node.imported.value) ===
          "tryCatch"
    : definition.node.type === "ImportNamespaceSpecifier" &&
        propertyName(callee) === "tryCatch";
}

// shortcut: Tracks direct fetch returns; add data-flow analysis when intermediate bindings need enforcement.
function returnsFetchResponse(node, context) {
  const operation = unwrap(node);

  if (isFetchCall(operation, context)) {
    return true;
  }

  if (
    !["ArrowFunctionExpression", "FunctionExpression"].includes(operation?.type)
  ) {
    return false;
  }

  if (operation.body.type !== "BlockStatement") {
    return isFetchCall(operation.body, context);
  }

  const returns = operation.body.body.filter(
    (statement) => statement.type === "ReturnStatement"
  );

  return returns.length === 1 && isFetchCall(returns[0].argument, context);
}

function resultUse(node) {
  let use = node;

  while (
    use.parent &&
    [
      "AwaitExpression",
      "ChainExpression",
      "TSAsExpression",
      "TSNonNullExpression",
      "TSSatisfiesExpression",
      "TSTypeAssertion",
    ].includes(use.parent.type)
  ) {
    use = use.parent;
  }

  return use;
}

function discardsResult(node) {
  const use = resultUse(node);

  if (
    use.parent?.type === "UnaryExpression" &&
    use.parent.operator === "void"
  ) {
    return true;
  }

  if (use.parent?.type === "SequenceExpression") {
    return use.parent.expressions.at(-1) !== use || discardsResult(use.parent);
  }

  return use.parent?.type === "ExpressionStatement";
}

function discardsResponseData(node) {
  const use = resultUse(node);
  const { parent } = use;
  let pattern;

  if (parent?.type === "VariableDeclarator") {
    pattern = parent.id;
  } else if (parent?.type === "AssignmentExpression" && parent.right === use) {
    pattern = parent.left;
  }

  if (pattern?.type === "ObjectPattern") {
    return !pattern.properties.some(
      (property) =>
        property.type === "RestElement" ||
        (property.computed && property.key.type !== "Literal") ||
        (!property.computed &&
          (property.key.name ?? property.key.value) === "data") ||
        (property.computed && property.key.value === "data")
    );
  }

  return (
    parent?.type === "MemberExpression" && propertyName(parent) === "error"
  );
}

const noDiscardedResponse = {
  meta: {
    type: "problem",
    docs: {
      description: "Keep fetch responses so HTTP failures can be handled",
    },
    schema: [],
    messages: {
      discardedResponse:
        "Do not discard a fetch response. Check response.ok or response.status, or forward the response to a handler. tryCatch only catches rejected requests, not HTTP errors.",
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        const fetchCall = isFetchCall(node, context);

        const wrappedFetch =
          isTryCatchCall(node, context) &&
          returnsFetchResponse(node.arguments[0], context);

        if (
          (fetchCall && discardsResult(node)) ||
          (wrappedFetch && (discardsResult(node) || discardsResponseData(node)))
        ) {
          context.report({ node, messageId: "discardedResponse" });
        }
      },
    };
  },
};

// shortcut: Only checks inline options; add binding analysis if shared options become common.
function hasFetchSignal(node) {
  const options = unwrap(node.arguments[1]);

  if (options?.type !== "ObjectExpression") {
    return false;
  }

  let hasSignal = false;

  for (const property of options.properties) {
    if (
      property.type === "SpreadElement" ||
      (property.computed && property.key.type !== "Literal")
    ) {
      hasSignal = false;
    } else if ((property.key.name ?? property.key.value) === "signal") {
      const value = unwrap(property.value);

      hasSignal =
        property.kind === "init" &&
        !property.method &&
        !(value.type === "Literal" && value.value === null) &&
        !(value.type === "Identifier" && value.name === "undefined") &&
        !(value.type === "UnaryExpression" && value.operator === "void");
    }
  }

  return hasSignal;
}

const requireFetchSignal = {
  meta: {
    type: "problem",
    docs: {
      description: "Require an explicit abort signal on server fetch calls",
    },
    schema: [],
    messages: {
      missingSignal:
        "Pass an explicit signal, preferably AbortSignal.timeout(ms), or an inherited signal. For intentional streams, suppress this rule with an explanation.",
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (isFetchCall(node, context) && !hasFetchSignal(node)) {
          context.report({ node, messageId: "missingSignal" });
        }
      },
    };
  },
};

function fetchBinding(node, context) {
  const use = resultUse(node);
  const declaration = use.parent;

  if (declaration?.type !== "VariableDeclarator") {
    return;
  }

  if (declaration.id.type === "Identifier") {
    return findVariable(declaration.id, context);
  }

  if (declaration.id.type === "ObjectPattern") {
    const data = declaration.id.properties.find(
      (property) =>
        property.type === "Property" &&
        (property.key.name ?? property.key.value) === "data"
    );

    if (data?.value.type === "Identifier") {
      return findVariable(data.value, context);
    }
  }
}

function isFetchPromise(node, context) {
  const expression = unwrap(node);

  if (isFetchCall(expression, context)) {
    return true;
  }

  if (expression?.type === "Identifier") {
    const [definition] = findVariable(expression, context)?.defs ?? [];

    return isFetchCall(definition?.node.init, context);
  }

  return false;
}

const noFetchPromiseChain = {
  meta: {
    type: "suggestion",
    docs: { description: "Await fetch instead of chaining promise handlers" },
    schema: [],
    messages: {
      awaitFetch:
        "Await fetch and handle failures with tryCatch from @/utils/try-catch instead of chaining .then(), .catch(), or .finally(). Check response.ok before reading the body.",
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        const callee = unwrap(node.callee);

        if (
          callee.type === "MemberExpression" &&
          ["then", "catch", "finally"].includes(propertyName(callee)) &&
          isFetchPromise(callee.object, context)
        ) {
          context.report({ node, messageId: "awaitFetch" });
        }
      },
    };
  },
};

function executionScope(node) {
  let scope = node;

  while (
    scope.parent &&
    ![
      "ArrowFunctionExpression",
      "FunctionExpression",
      "FunctionDeclaration",
      "Program",
    ].includes(scope.type)
  ) {
    scope = scope.parent;
  }

  return scope;
}

// shortcut: Checks local status reads, not control flow; add path analysis if conditional checks cause misses.
function checksFetchStatus(node, variable) {
  const reads = variable.references.filter((reference) => reference.isRead());

  const members = [];

  for (const { identifier } of reads) {
    if (
      identifier.parent.type === "MemberExpression" &&
      identifier.parent.object === identifier
    ) {
      members.push(identifier.parent);
    }
  }

  const bodyReads = members.filter((member) =>
    [
      "json",
      "text",
      "blob",
      "arrayBuffer",
      "formData",
      "bytes",
      "body",
    ].includes(propertyName(member))
  );

  const checks = members.filter((member) => propertyName(member) === "ok");

  if (bodyReads.length) {
    return bodyReads.every((body) =>
      checks.some(
        (check) =>
          check.range[0] < body.range[0] &&
          executionScope(check) === executionScope(body)
      )
    );
  }

  return (
    checks.some((check) => executionScope(check) === executionScope(node)) ||
    reads.some(
      (reference) => reference.identifier.parent.type === "ReturnStatement"
    )
  );
}

const requireFetchOk = {
  meta: {
    type: "problem",
    docs: { description: "Check fetch response.ok before consuming the body" },
    schema: [],
    messages: {
      checkStatus:
        "Check response.ok before reading the fetch response body. fetch does not reject HTTP error statuses; tryCatch only handles rejected operations.",
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        const fetchCall = isFetchCall(node, context);

        const wrappedFetch =
          isTryCatchCall(node, context) &&
          returnsFetchResponse(node.arguments[0], context);

        if (!fetchCall && !wrappedFetch) {
          return;
        }

        const variable = fetchBinding(node, context);

        if (variable && !checksFetchStatus(node, variable)) {
          context.report({ node, messageId: "checkStatus" });
        } else if (
          !variable &&
          resultUse(node).parent?.type === "MemberExpression"
        ) {
          context.report({ node, messageId: "checkStatus" });
        }
      },
    };
  },
};

const noSecretInUrl = {
  meta: {
    type: "problem",
    docs: { description: "Keep credentials out of URL query parameters" },
    schema: [],
    messages: {
      secretInUrl:
        "Do not put credentials in URL query parameters. Use an Authorization header or the API's supported credential header instead. URLs can leak through logs and browser history.",
    },
  },
  create(context) {
    function checkUrl(node, value) {
      if (/[?&](?:secret|token|key|api_?key)=/iu.test(value)) {
        context.report({ node, messageId: "secretInUrl" });
      }
    }

    return {
      Literal(node) {
        if (!node.regex) {
          checkUrl(node, node.value);
        }
      },
      TemplateElement(node) {
        checkUrl(node, node.value.cooked ?? node.value.raw);
      },
    };
  },
};

export default {
  meta: { name: "http" },
  rules: {
    "no-discarded-response": noDiscardedResponse,
    "no-fetch-promise-chain": noFetchPromiseChain,
    "no-secret-in-url": noSecretInUrl,
    "require-fetch-ok": requireFetchOk,
    "require-fetch-signal": requireFetchSignal,
  },
};
