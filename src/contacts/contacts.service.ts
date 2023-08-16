import { Injectable } from '@nestjs/common';
import { In, Not, Repository } from 'typeorm';
import { Contact } from './contacts.entity/contacts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IdentityDto, IdentityResponseDto } from './contacts.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact) private contactRepository: Repository<Contact>,
  ) {}

  async getContacts(): Promise<Contact[]> {
    const data = await this.contactRepository.find({ order: { id: 'ASC' } });
    return data;
  }

  async insertCheckoutRecord(data: IdentityDto): Promise<string> {
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
        id: 'ASC',
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
    const promises = [];

    promises.push(
      this.contactRepository.update(primaryRecord.id, {
        linkPrecedence: 'primary',
        linkedId: null,
      }),
    );

    // update the existing records to point to the new primary
    promises.push(
      this.contactRepository
        .createQueryBuilder()
        .update()
        .set({ linkPrecedence: 'secondary', linkedId: primaryRecord.id })
        .where({ id: In(secondaryRecords.map((ele) => ele.id)) })
        .execute(),
    );

    // only one case left to handle, if there's two primary records. And a third
    // comes with information from both, we don't need to insert the new one as there
    // is no new information.
    // solution: only insert new info when there is some new email or phone not existing.
    const existingPhone =
      commonRecords.filter((ele) => ele.phoneNumber === data.phoneNumber)
        .length > 0;
    const existingEmail =
      commonRecords.filter((ele) => ele.email === data.email).length > 0;

    if (!existingPhone || !existingEmail) {
      const contact = this.contactRepository.create({
        phoneNumber: data.phoneNumber,
        email: data.email,
        linkedId: primaryRecord.id,
        linkPrecedence: 'secondary',
      });

      await this.contactRepository.save(contact);
    }

    return 'success';
  }

  async identify(data: IdentityDto): Promise<IdentityResponseDto> {
    const matchingRecords = await this.contactRepository.find({
      select: {
        id: true,
        phoneNumber: true,
        email: true,
        linkedId: true,
        linkPrecedence: true,
      },
      where: [{ phoneNumber: data.phoneNumber }, { email: data.email }],
      order: {
        id: 'ASC',
      },
    });

    let linkedRecords: any | any[] = [];

    if (matchingRecords && matchingRecords.length) {
      // I know bad code in this block
      const placeholders = matchingRecords
        .map((_, index) => `$${index + 4}`)
        .join(', ');

      const sql = `select id, phoneNumber, email, linkedId, linkPrecedence from contact
        where (id = $1 or linkedId = $2) and id not in (${placeholders})`;
      const params = [
        matchingRecords[0].linkedId,
        matchingRecords[0].id,
        ...matchingRecords.map((ele) => ele.id),
      ];

      linkedRecords = await this.contactRepository.query(sql, params);
    }

    // we sort by id and ensure primary record comes first. ( we mantain this with insertion )
    const records = [...linkedRecords, ...matchingRecords].sort(
      (a: Contact, b: Contact) => a.id - b.id,
    );

    const primaryRecord =
      records && records.length
        ? records[0]
        : { id: null, email: null, phoneNumber: null };

    const secondaryRecords: Contact[] = records.slice(1);

    const secondaryEmails = [];
    const secondaryNumbers = [];

    for (let i = 0; i < secondaryRecords.length; i += 1) {
      if (secondaryRecords[i].email !== primaryRecord.email)
        secondaryEmails.push(secondaryRecords[i].email);
      if (secondaryRecords[i].phoneNumber !== primaryRecord.phoneNumber)
        secondaryNumbers.push(secondaryRecords[i].phoneNumber);
    }

    const res: IdentityResponseDto = {
      primaryContactId: primaryRecord.id,
      emails: [primaryRecord.email, ...secondaryEmails],
      phoneNumbers: [primaryRecord.phoneNumber, ...secondaryNumbers],
      secondaryContactIds: secondaryRecords.map((ele) => ele.id),
    };

    return res;
  }

  async clearDb() {
    await this.contactRepository.delete({});
    return 'OK';
  }
}
