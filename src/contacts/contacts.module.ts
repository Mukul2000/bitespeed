import { Module } from '@nestjs/common';
import { ContactController } from './contacts.controller';
import { ContactService } from './contacts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from './contacts.entity/contacts.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contact])],
  providers: [ContactService],
  controllers: [ContactController],
})
export class ContactsModule {}
