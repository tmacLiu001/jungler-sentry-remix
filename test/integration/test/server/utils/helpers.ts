import express from 'express';
import { createRequestHandler } from '@remix-run/express';
import { getPortPromise } from 'portfinder';
import { wrapExpressCreateRequestHandler } from '@sentry/remix';
import { TestEnv } from '../../../../../../node-integration-tests/utils';
import * as http from 'http';

export * from '../../../../../../node-integration-tests/utils';

export class RemixTestEnv extends TestEnv {
  private constructor(public readonly server: http.Server, public readonly url: string) {
    super(server, url);
  }

  public static async init(adapter: string = 'builtin'): Promise<RemixTestEnv> {
    const requestHandlerFactory =
      adapter === 'express' ? wrapExpressCreateRequestHandler(createRequestHandler) : createRequestHandler;

    const port = await getPortPromise();

    const server = await new Promise<http.Server>(resolve => {
      const app = express();

      app.all('*', requestHandlerFactory({ build: require('../../../build') }));

      const server = app.listen(port, () => {
        resolve(server);
      });
    });

    return new RemixTestEnv(server, `http://localhost:${port}`);
  }
}
