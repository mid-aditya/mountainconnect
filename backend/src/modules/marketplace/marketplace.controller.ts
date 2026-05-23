import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get()
  async findAll(
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('condition') condition?: string,
    @Query('location') location?: string,
    @Query('search') search?: string,
  ) {
    return this.marketplaceService.findAll({
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      condition,
      location,
      search,
    });
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.marketplaceService.findById(id);
  }

  @Post()
  async create(@Body() body: {
    sellerId: string;
    title: string;
    description?: string;
    price: number;
    condition?: string;
    categoryId?: string;
    images?: string[];
    location?: string;
  }) {
    return this.marketplaceService.create(body);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: any,
  ) {
    return this.marketplaceService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.marketplaceService.delete(id);
    return { success: true };
  }

  @Post(':id/sold')
  async markAsSold(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('buyerId') buyerId: string,
  ) {
    return this.marketplaceService.markAsSold(id, buyerId);
  }

  @Post(':id/escrow')
  async initiateEscrow(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('buyerId') buyerId: string,
  ) {
    return this.marketplaceService.initiateEscrow(id, buyerId);
  }

  @Post(':id/escrow/release')
  async releaseEscrow(@Param('id', ParseUUIDPipe) id: string) {
    return this.marketplaceService.releaseEscrow(id);
  }

  @Post(':id/escrow/dispute')
  async disputeEscrow(@Param('id', ParseUUIDPipe) id: string) {
    return this.marketplaceService.disputeEscrow(id);
  }
}
