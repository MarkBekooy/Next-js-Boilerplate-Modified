import path from "node:path";

function propertyName(node) {
  return node?.type === "Identifier" ? node.name : node?.value;
}

function methodName(node) {
  return node?.type === "CallExpression" &&
    node.callee.type === "MemberExpression"
    ? propertyName(node.callee.property)
    : undefined;
}

function importedBinding(node, context) {
  if (node?.type !== "Identifier") {
    return;
  }

  for (
    let scope = context.sourceCode.getScope(node);
    scope;
    scope = scope.upper
  ) {
    const variable = scope.set.get(node.name);

    if (variable) {
      const [definition] = variable.defs;

      if (definition?.type === "ImportBinding") {
        return {
          source: definition.parent.source.value,
        };
      }

      return;
    }
  }
}

function isModule(source, directory, context) {
  if (!source) {
    return false;
  }

  if (source === `@/${directory}` || source.startsWith(`@/${directory}/`)) {
    return true;
  }

  if (!source.startsWith(".")) {
    return false;
  }

  const target = path.resolve(path.dirname(context.filename), source);
  const expected = path.resolve(context.cwd, "src", directory);

  return (
    target === expected ||
    target.startsWith(`${expected}/`) ||
    target.startsWith(`${expected}\\`)
  );
}

function isParsed(node, context) {
  const awaited = node?.type === "AwaitExpression";
  const call = awaited ? node.argument : node;
  const method = methodName(call);

  if (method !== "parse" && !(awaited && method === "parseAsync")) {
    return false;
  }

  const binding = importedBinding(call.callee.object, context);

  return isModule(binding?.source, "validations", context);
}

function writeChain(node) {
  const calls = [node];
  let current = node;

  while (
    current.parent?.type === "MemberExpression" &&
    current.parent.object === current &&
    current.parent.parent?.type === "CallExpression"
  ) {
    current = current.parent.parent;
    calls.push(current);
  }

  return calls;
}

function checkUpsert(call, context) {
  const [config] = call.arguments;

  const properties =
    config?.type === "ObjectExpression" ? config.properties : [];

  const set = properties.find((item) => propertyName(item.key) === "set");

  if (
    properties.some((item) => item.type === "SpreadElement") ||
    !isParsed(set?.value, context)
  ) {
    context.report({ node: call, messageId: "payload" });
  }
}

const requireValidatedWrites = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Require schemas from src/validations for database write payloads",
    },
    schema: [],
    messages: {
      payload:
        "Validate database write data inline with a schema imported from @/validations. Use schema.parse(input), or await schema.parseAsync(input), in values(), set() and upsert set. Create or reuse the schema in src/validations.",
    },
  },
  create(context) {
    // shortcut: Follows db/tx fluent builders; add dedicated checks when introducing raw SQL or write helpers.
    return {
      CallExpression(node) {
        const operation = methodName(node);

        const client =
          node.callee.type === "MemberExpression"
            ? node.callee.object
            : undefined;

        if (
          !["insert", "update"].includes(operation) ||
          client?.type !== "Identifier" ||
          !["db", "tx"].includes(client.name)
        ) {
          return;
        }

        const chain = writeChain(node);

        const payload = chain.find(
          (call) =>
            methodName(call) === (operation === "insert" ? "values" : "set")
        );

        if (!isParsed(payload?.arguments[0], context)) {
          context.report({ node: payload ?? node, messageId: "payload" });
        }

        for (const call of chain.filter(
          (item) => methodName(item) === "onConflictDoUpdate"
        )) {
          checkUpsert(call, context);
        }
      },
    };
  },
};

export default {
  meta: { name: "database" },
  rules: { "require-validated-writes": requireValidatedWrites },
};
