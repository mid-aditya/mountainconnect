import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForumCategory, ForumThread, ForumPost } from './community.entity';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(ForumCategory)
    private readonly categoryRepo: Repository<ForumCategory>,
    @InjectRepository(ForumThread)
    private readonly threadRepo: Repository<ForumThread>,
    @InjectRepository(ForumPost)
    private readonly postRepo: Repository<ForumPost>,
  ) {}

  // Categories
  async getCategories(): Promise<ForumCategory[]> {
    return this.categoryRepo.find({ where: { isActive: true }, order: { name: 'ASC' } });
  }

  async createCategory(dto: { name: string; description?: string }): Promise<ForumCategory> {
    const cat = this.categoryRepo.create(dto);
    return this.categoryRepo.save(cat);
  }

  // Threads
  async getThreads(categoryId?: string, search?: string): Promise<ForumThread[]> {
    const qb = this.threadRepo.createQueryBuilder('t').where('t.isActive = :active', { active: true });

    if (categoryId) qb.andWhere('t.categoryId = :categoryId', { categoryId });
    if (search) qb.andWhere('(t.title ILIKE :search OR t.content ILIKE :search)', { search: `%${search}%` });

    return qb.orderBy('t.isPinned', 'DESC').addOrderBy('t.createdAt', 'DESC').getMany();
  }

  async getThreadById(id: string): Promise<ForumThread> {
    const thread = await this.threadRepo.findOne({
      where: { id, isActive: true },
      relations: ['posts', 'category'],
    });
    if (!thread) throw new NotFoundException(`Thread #${id} not found`);
    // Increment view count
    await this.threadRepo.increment({ id }, 'viewCount', 1);
    return thread;
  }

  async createThread(dto: { title: string; content: string; authorId: string; categoryId: string }): Promise<ForumThread> {
    const thread = this.threadRepo.create(dto);
    const saved = await this.threadRepo.save(thread);
    await this.categoryRepo.increment({ id: dto.categoryId }, 'threadCount', 1);
    return saved;
  }

  async reportThread(id: string): Promise<void> {
    console.log(`[Community] Thread #${id} reported for review`);
    // In production: flag for moderation queue
  }

  // Posts
  async getPosts(threadId: string): Promise<ForumPost[]> {
    return this.postRepo.find({
      where: { threadId, isActive: true },
      order: { createdAt: 'ASC' },
    });
  }

  async createPost(dto: { content: string; authorId: string; threadId: string }): Promise<ForumPost> {
    const post = this.postRepo.create(dto);
    const saved = await this.postRepo.save(post);
    await this.threadRepo.increment({ id: dto.threadId }, 'replyCount', 1);
    return saved;
  }

  async reportPost(id: string): Promise<void> {
    console.log(`[Community] Post #${id} reported for review`);
  }

  async deleteThread(id: string): Promise<void> {
    const thread = await this.threadRepo.findOne({ where: { id } });
    if (!thread) throw new NotFoundException('Thread not found');
    thread.isActive = false;
    await this.threadRepo.save(thread);
  }

  async deletePost(id: string): Promise<void> {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    post.isActive = false;
    await this.postRepo.save(post);
  }
}
