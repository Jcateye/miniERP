import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      service: 'miniERP-server',
      status: 'ok',
    };
  }
}
