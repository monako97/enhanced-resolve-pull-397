import { join, relative } from 'path';
import { existsSync } from 'fs';

const programPath = process.cwd();
class ResolverPlugin {
    constructor(){}
    apply(resolver) {
        const rPrev = `./${relative(programPath, 'src')}`;
        const rNext = `./${relative(programPath, 'patch')}`;
  
        resolver
          .getHook('existing-file')
          .tapAsync('ResolverPlugin', (request, resolveContext, callback) => {
            const inner = request.request || request.path;
  
            if (inner && inner.startsWith(join(programPath, 'src')) && request.relativePath) {
              const overridePath = inner.replace(join(programPath, 'src'), join(programPath, 'patch'));
  
              if (existsSync(overridePath)) {
                const relativePath = request.relativePath.replace(rPrev, rNext);
  
                Object.assign(request, {
                  path: overridePath,
                  relativePath: relativePath,
                  __innerRequest_relativePath: relativePath,
                  __innerRequest: relativePath,
                });
                return resolver.doResolve(
                  'resolved',
                  request,
                  `ResolverPlugin use patch`,
                  resolveContext,
                  callback,
                );
              }
            }
  
            return callback();
          });
      }
}

export default {
    entry: join(process.cwd(), 'src/index.js'),
    mode: "production",
    resolve: {
        plugins: [
            new ResolverPlugin()
        ]
    }
}