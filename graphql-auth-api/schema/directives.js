const { mapSchema, getDirective, MapperKind } = require("@graphql-tools/utils");

function authDirectiveTransformer(schema, getUser) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig, fieldName, typeName) => {
      const auth = getDirective(schema, fieldConfig, "auth")?.[0];
      if (auth) {
        const { requires } = auth;
        const { resolve = defaultFieldResolver } = fieldConfig;
        fieldConfig.resolve = async (src, args, context, info) => {
          const user = await getUser(context.headers.authToken);
          if (!user || !user.hasRole(requires)) {
            throw new Error("Not authorized");
          }
          return resolve(src, args, context, info);
        };
        return fieldConfig;
      }
    },
  });
}

module.exports = { authDirectiveTransformer };
