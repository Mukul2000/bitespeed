import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity()
export class Contact {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ length: 12, nullable: true })
  phoneNumber: string;

  @Index()
  @Column({ length: 100, nullable: true })
  email: string;

  @Column('int', { nullable: true })
  linkedId: number;

  @Column()
  linkPrecedence: 'secondary' | 'primary';

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @Column('datetime', { nullable: true })
  deletedAt: string;
}
