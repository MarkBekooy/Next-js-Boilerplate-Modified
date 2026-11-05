export default {
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
