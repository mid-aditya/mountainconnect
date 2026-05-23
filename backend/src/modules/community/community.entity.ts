import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('forum_categories')
export class ForumCategory extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 0 })
  threadCount: number;

  @OneToMany(() => ForumThread, (thread) => thread.category)
  threads: ForumThread[];
}

@Entity('forum_threads')
export class ForumThread extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'author_id' })
  authorId: string;

  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => ForumCategory, (cat) => cat.threads, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: ForumCategory;

  @Column({ name: 'reply_count', default: 0 })
  replyCount: number;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ name: 'is_pinned', default: false })
  isPinned: boolean;

  @Column({ name: 'is_locked', default: false })
  isLocked: boolean;

  @OneToMany(() => ForumPost, (post) => post.thread)
  posts: ForumPost[];
}

@Entity('forum_posts')
export class ForumPost extends BaseEntity {
  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'author_id' })
  authorId: string;

  @Column({ name: 'thread_id' })
  threadId: string;

  @ManyToOne(() => ForumThread, (thread) => thread.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'thread_id' })
  thread: ForumThread;

  @Column({ name: 'is_accepted', default: false })
  isAccepted: boolean;
}
