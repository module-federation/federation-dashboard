const fs = require("fs");
const parser = require("@babel/parser");
const generate = require("@babel/generator").default;
const traverse = require("@babel/traverse").default;
const { isNode } = require("@babel/types");

class FunctionCallPlugin {
  constructor() {
    this.functionName = "federateComponent";
    this.callback = () => {};
    this.name = "FunctionCallPlugin";
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync(this.name, (compilation, callback) => {
      const filePaths = [];
      const allArgumentsUsed = [];
      // Explore each chunk (build output):
      compilation.chunks.forEach((chunk) => {
        // Explore each module within the chunk (built inputs):
        chunk.getModules().forEach((module) => {
          // Loop through all the dependencies that has the named export that we are looking for
          const matchedNamedExports = module.dependencies.filter((dep) => {
            return dep.name === this.functionName;
          });

          if (matchedNamedExports.length > 0) {
            // we know that this module exported the function we care about
            // now we need to know how many times this function is invoked in the source code
            // along with all the arguments of it

            // these modules could be a combination of multiple source files, so we need to traverse
            // through its fileDependencies
            if (module.resource) {
              filePaths.push({
                resource: module.resource,
                file: module.resourceResolveData.relativePath,
              });
            }
          }
        });

        filePaths.forEach(({ resource, file }) => {
          const sourceCode = fs.readFileSync(resource).toString("utf-8");
          const ast = parser.parse(sourceCode, {
            sourceType: "module", // only works on ES modules
          });

          // traverse the abstract syntax tree
          traverse(ast, {
            /**
             * We want to run a function depending on a found nodeType
             * More node types are documented here: https://babeljs.io/docs/en/babel-types#api
             */
            CallExpression: (path) => {
              const node = path.node;
              const { callee, arguments: args } = node;

              if (callee.loc.identifierName === this.functionName) {
                const argsValue = [file];

                // we collect the JS representation of each argument used in this function call
                for (let i = 0; i < args.length; i += 1) {
                  const a = args[i];
                  let { code } = generate(a);

                  if (code.startsWith("{")) {
                    // wrap it in parentheses, so when it's eval-ed, it is eval-ed correctly into an JS object
                    code = `(${code})`;
                  }

                  const value = eval(code);

                  // If the value is a Node, that means it was a variable name
                  // There is no easy way to resolve the variable real value, so we just skip any function calls
                  // that has variable as its args
                  if (!isNode(value)) {
                    argsValue.push(value);
                  } else {
                    // by breaking out of the loop here,
                    // we also prevent this args to be pushed to `allArgumentsUsed`
                    break;
                  }

                  if (i === args.length - 1) {
                    // push to the top level array
                    allArgumentsUsed.push(argsValue);
                  }
                }
              }
            },
          });
        });

        allArgumentsUsed.forEach((args) => {
          // call the callback with all the arguments
          this.callback({
            arguments: args,
          });
        });
      });

      callback();
    });
  }
}

module.exports = FunctionCallPlugin;
