import { Controller, Post } from '@nestjs/common';

@Controller()
export class ContactController {
  @Post('/identify')
  async identify() {}

  @Post('/checkout')
  async checkout() {}
}
