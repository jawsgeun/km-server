import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class AbstractEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @UpdateDateColumn({ comment: '수정일자' })
  dateUpdated: Date;

  @CreateDateColumn({ comment: '생성일자' })
  dateCreated: Date;
}
