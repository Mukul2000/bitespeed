import { Body, Controller, Get, Post } from '@nestjs/common';
import { identityDto } from './contacts.dto';
import { ContactService } from './contacts.service';

@Controller()
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get('/contacts')
  async getContacts() {
    return this.contactService.getContacts();
  }

  @Post('/identify')
  async identify(@Body() body: identityDto) {}

  @Post('/checkout')
  async checkout(@Body() body: identityDto) {
    await this.contactService.insertCheckoutRecord(body);
  }
}
