import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Contact } from './contacts.entity/contacts.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact) private contactRepository: Repository<Contact>,
  ) {}
}
