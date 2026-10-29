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

export default {
  meta: { name: "http" },
  rules: { "no-discarded-response": noDiscardedResponse },
};
