import { Inject, Injectable } from '@nestjs/common';
import * as net from 'node:net';
import { DATABASE_URL_TOKEN, REDIS_URL_TOKEN } from '../database/database.constants';

const DEFAULT_PORTS: Readonly<Record<string, number>> = {
  'postgres:': 5432,
  'postgresql:': 5432,
  'mysql:': 3306,
  'mariadb:': 3306,
  'sqlserver:': 1433,
  'mongodb:': 27017,
  'redis:': 6379,
  'rediss:': 6379,
};

const DEPENDENCY_CHECK_TIMEOUT_MS = 1500;

export type DependencyName = 'database' | 'redis';

export type DependencyStatus = 'up' | 'down';

export interface DependencyReadiness {
  readonly name: DependencyName;
  readonly status: DependencyStatus;
  readonly error?: string;
}

interface TcpEndpoint {
  readonly host: string;
  readonly port: number;
}

@Injectable()
export class HealthService {
  constructor(
    @Inject(DATABASE_URL_TOKEN) private readonly databaseUrl: string,
    @Inject(REDIS_URL_TOKEN) private readonly redisUrl: string,
  ) {}

  getLiveness() {
    return {
      data: {
        status: 'live',
      },
      message: 'Service is alive',
    };
  }

  async getReadiness() {
    const dependencies = await Promise.all([
      this.checkDependency('database', this.databaseUrl),
      this.checkDependency('redis', this.redisUrl),
    ]);

    const isReady = dependencies.every((dependency) => dependency.status === 'up');

    return {
      data: {
        status: isReady ? 'ready' : 'not_ready',
        dependencies,
      },
      message: isReady ? 'Service is ready' : 'Service is not ready',
    };
  }

  private async checkDependency(name: DependencyName, connectionUrl: string): Promise<DependencyReadiness> {
    try {
      const endpoint = this.resolveTcpEndpoint(connectionUrl);
      await this.probeTcpConnection(endpoint);

      return {
        name,
        status: 'up',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Dependency check failed';

      return {
        name,
        status: 'down',
        error: errorMessage,
      };
    }
  }

  private resolveTcpEndpoint(connectionUrl: string): TcpEndpoint {
    const parsedUrl = new URL(connectionUrl);

    if (!parsedUrl.hostname) {
      throw new Error('Missing hostname in connection URL');
    }

    if (parsedUrl.port.length > 0) {
      const explicitPort = Number(parsedUrl.port);

      if (!Number.isInteger(explicitPort) || explicitPort < 1 || explicitPort > 65535) {
        throw new Error(`Invalid port in connection URL: ${parsedUrl.port}`);
      }

      return {
        host: parsedUrl.hostname,
        port: explicitPort,
      };
    }

    const fallbackPort = DEFAULT_PORTS[parsedUrl.protocol];

    if (typeof fallbackPort === 'undefined') {
      throw new Error(`Unsupported protocol without explicit port: ${parsedUrl.protocol}`);
    }

    return {
      host: parsedUrl.hostname,
      port: fallbackPort,
    };
  }

  private probeTcpConnection(endpoint: TcpEndpoint): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = net.createConnection({ host: endpoint.host, port: endpoint.port });

      const cleanup = (): void => {
        socket.removeAllListeners('connect');
        socket.removeAllListeners('error');
        socket.removeAllListeners('timeout');
      };

      socket.setTimeout(DEPENDENCY_CHECK_TIMEOUT_MS);

      socket.once('connect', () => {
        cleanup();
        socket.end();
        resolve();
      });

      socket.once('error', (error: Error) => {
        cleanup();
        socket.destroy();
        reject(error);
      });

      socket.once('timeout', () => {
        cleanup();
        socket.destroy();
        reject(new Error(`Connection timeout after ${DEPENDENCY_CHECK_TIMEOUT_MS}ms`));
      });
    });
  }
}
