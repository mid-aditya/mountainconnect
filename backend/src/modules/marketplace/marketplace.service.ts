import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketplaceItem, ItemStatus, EscrowStatus } from './marketplace.entity';

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectRepository(MarketplaceItem)
    private readonly itemRepo: Repository<MarketplaceItem>,
  ) {}

  async findAll(filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    location?: string;
    search?: string;
  }): Promise<MarketplaceItem[]> {
    const qb = this.itemRepo
      .createQueryBuilder('i')
      .where('i.status = :status', { status: ItemStatus.ACTIVE });

    if (filters.category) {
      qb.andWhere('i.categoryId = :category', { category: filters.category });
    }
    if (filters.minPrice) {
      qb.andWhere('i.price >= :minPrice', { minPrice: filters.minPrice });
    }
    if (filters.maxPrice) {
      qb.andWhere('i.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }
    if (filters.condition) {
      qb.andWhere('i.condition = :condition', { condition: filters.condition });
    }
    if (filters.location) {
      qb.andWhere('i.location ILIKE :location', { location: `%${filters.location}%` });
    }
    if (filters.search) {
      qb.andWhere(
        '(i.title ILIKE :search OR i.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    return qb.orderBy('i.createdAt', 'DESC').getMany();
  }

  async findById(id: string): Promise<MarketplaceItem> {
    const item = await this.itemRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Item #${id} not found`);
    return item;
  }

  async create(dto: {
    sellerId: string;
    title: string;
    description?: string;
    price: number;
    condition?: string;
    categoryId?: string;
    images?: string[];
    location?: string;
  }): Promise<MarketplaceItem> {
    const item = this.itemRepo.create({
      sellerId: dto.sellerId,
      title: dto.title,
      description: dto.description,
      price: dto.price,
      condition: (dto.condition as any) || 'good',
      categoryId: dto.categoryId,
      images: dto.images || [],
      location: dto.location,
      status: ItemStatus.ACTIVE,
    });
    return this.itemRepo.save(item);
  }

  async update(id: string, dto: Partial<{
    title: string;
    description: string;
    price: number;
    condition: string;
    categoryId: string;
    images: string[];
    location: string;
  }>): Promise<MarketplaceItem> {
    const item = await this.findById(id);
    Object.assign(item, dto);
    return this.itemRepo.save(item);
  }

  async delete(id: string): Promise<void> {
    const item = await this.findById(id);
    item.isActive = false;
    item.status = ItemStatus.ARCHIVED;
    await this.itemRepo.save(item);
  }

  async markAsSold(itemId: string, buyerId: string): Promise<MarketplaceItem> {
    const item = await this.findById(itemId);
    if (item.isSold) throw new BadRequestException('Item already sold');
    item.isSold = true;
    item.buyerId = buyerId;
    item.status = ItemStatus.SOLD;
    return this.itemRepo.save(item);
  }

  async initiateEscrow(itemId: string, buyerId: string): Promise<MarketplaceItem> {
    const item = await this.findById(itemId);
    if (item.isSold) throw new BadRequestException('Item already sold');
    item.escrowStatus = EscrowStatus.PENDING;
    item.buyerId = buyerId;
    return this.itemRepo.save(item);
  }

  async releaseEscrow(itemId: string): Promise<MarketplaceItem> {
    const item = await this.findById(itemId);
    if (item.escrowStatus !== EscrowStatus.PENDING) {
      throw new BadRequestException('Escrow not pending');
    }
    item.escrowStatus = EscrowStatus.RELEASED;
    item.isSold = true;
    item.status = ItemStatus.SOLD;
    return this.itemRepo.save(item);
  }

  async disputeEscrow(itemId: string): Promise<MarketplaceItem> {
    const item = await this.findById(itemId);
    if (item.escrowStatus !== EscrowStatus.PENDING) {
      throw new BadRequestException('Escrow not pending');
    }
    item.escrowStatus = EscrowStatus.DISPUTED;
    return this.itemRepo.save(item);
  }
}
