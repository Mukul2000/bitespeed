import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { Contact } from './contacts.entity/contacts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { identityDto } from './contacts.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact) private contactRepository: Repository<Contact>,
  ) {}

  async insertCheckoutRecord(data: identityDto): Promise<string> {
    // can add validations for phone and email optionally, skipping for now.

    const commonRecords = await this.contactRepository.find({
      select: {
        id: true,
        phoneNumber: true,
        email: true,
        linkedId: true,
        linkPrecedence: true,
      },
      where: [{ phoneNumber: data.phoneNumber }, { email: data.email }],
      order: {
        id: 'DESC',
      },
    });

    if (commonRecords.length === 0) {
      // no common records, we insert a new primary record
      const contact = this.contactRepository.create({
        phoneNumber: data.phoneNumber,
        email: data.email,
        linkedId: null,
        linkPrecedence: 'primary',
      });
      await this.contactRepository.save(contact);
      return 'success';
    }

    // 1. If exactly same record exists already, do nothing.
    const exactMatch = commonRecords.filter(
      (ele) => ele.phoneNumber === data.phoneNumber && ele.email === data.email,
    );

    if (exactMatch.length) return 'success';

    /*
      2. There's a bunch of records with common info
      we'll take the oldest record and make it primary rest become secondary.
    */

    // records are already sorted by id
    const primaryRecord = commonRecords[0];
    const secondaryRecords = commonRecords.slice(1);

    await this.contactRepository.update(primaryRecord.id, {
      linkPrecedence: 'primary',
    });

    await this.contactRepository
      .createQueryBuilder()
      .update(Contact)
      .set({ linkPrecedence: 'secondary', linkedId: primaryRecord.id })
      .where({ id: In(secondaryRecords.map((ele) => ele.id)) })
      .execute();
  }
}
