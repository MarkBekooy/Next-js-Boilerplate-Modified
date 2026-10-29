function isTryCatchCall(node, context) {
  if (node?.type !== "CallExpression" || node.callee.type !== "Identifier") {
    return false;
  }

  for (
    let scope = context.sourceCode.getScope(node);
    scope;
    scope = scope.upper
  ) {
    const variable = scope.set.get(node.callee.name);

    if (variable) {
      const [definition] = variable.defs;

      return (
        definition?.type === "ImportBinding" &&
        definition.node.type === "ImportSpecifier" &&
        definition.node.imported.name === "tryCatch" &&
        definition.parent.source.value === "@/utils/try-catch"
      );
    }
  }

  return false;
}

const preferTryCatch = {
  meta: {
    type: "problem",
    docs: { description: "Use the shared tryCatch helper for error handling" },
    schema: [],
    messages: {
      useTryCatch:
        "Use tryCatch from @/utils/try-catch instead of a native try/catch block. Alias results with operation-specific names, such as { data: parsedProfile, error: profileParseError }.",
      nameResult:
        "Alias tryCatch results with operation-specific names, such as { data: parsedProfile, error: profileParseError }. Do not bind generic data or error variables.",
    },
  },
  create(context) {
    return {
      CatchClause(node) {
        context.report({ node, messageId: "useTryCatch" });
      },
      VariableDeclarator(node) {
        const operation =
          node.init?.type === "AwaitExpression"
            ? node.init.argument
            : node.init;

        if (
          node.id.type !== "ObjectPattern" ||
          !isTryCatchCall(operation, context)
        ) {
          return;
        }

        for (const property of node.id.properties) {
          if (property.type !== "Property") {
            continue;
          }

          const name = property.key.name ?? property.key.value;

          const binding =
            property.value.type === "AssignmentPattern"
              ? property.value.left
              : property.value;

          if (
            ["data", "error"].includes(name) &&
            (binding.type !== "Identifier" ||
              ["data", "error"].includes(binding.name))
          ) {
            context.report({ node: property, messageId: "nameResult" });
          }
        }
      },
    };
  },
};

export default {
  meta: { name: "error-handling" },
  rules: { "prefer-try-catch": preferTryCatch },
};
