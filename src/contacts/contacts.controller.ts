import { Body, Controller, Get, Post } from '@nestjs/common';
import { IdentityDto } from './contacts.dto';
import { ContactService } from './contacts.service';

@Controller()
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get('/contacts')
  async getContacts() {
    return this.contactService.getContacts();
  }

  @Post('/identify')
  async identify(@Body() body: IdentityDto) {
    return this.contactService.identify(body);
  }

  @Post('/checkout')
  async checkout(@Body() body: IdentityDto) {
    await this.contactService.insertCheckoutRecord(body);
  }
}
