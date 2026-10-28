function getPropertyName(node) {
  if (node.type === "Identifier") {
    return node.name;
  }

  if (node.type === "Literal") {
    return node.value;
  }
}

function isRouteParams(node) {
  if (node.type === "Identifier") {
    return node.name === "params";
  }

  return (
    node.type === "MemberExpression" &&
    getPropertyName(node.property) === "params" &&
    node.object.type === "Identifier" &&
    node.object.name === "props"
  );
}

function hasLocaleProperty(node) {
  return (
    node.type === "ObjectPattern" &&
    node.properties.some(
      (property) =>
        property.type === "Property" &&
        getPropertyName(property.key) === "locale"
    )
  );
}

const noLocaleFromRouteParams = {
  meta: {
    type: "problem",
    docs: { description: "Use next-intl to read the current locale" },
    schema: [],
    messages: {
      useNextIntlLocale:
        "Use `getLocale()` in async Server Components or `useLocale()` in Client Components instead of reading `locale` from route params.",
    },
  },
  create(context) {
    return {
      VariableDeclarator(node) {
        const { init } = node;

        if (
          init?.type === "AwaitExpression" &&
          isRouteParams(init.argument) &&
          hasLocaleProperty(node.id)
        ) {
          context.report({ node: node.id, messageId: "useNextIntlLocale" });
        }
      },
    };
  },
};

export default {
  meta: { name: "next-intl" },
  rules: { "no-locale-from-route-params": noLocaleFromRouteParams },
};
