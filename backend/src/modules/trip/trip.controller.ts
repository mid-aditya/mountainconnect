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
} from "@nestjs/common";
import { TripService } from "./trip.service";

@Controller("trips")
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.tripService.findAll(query);
  }

  @Get("available")
  async findAvailable(@Query() query: any) {
    return this.tripService.findAvailable(
      query?.date,
      query?.mountainId,
      query,
    );
  }

  @Get(":id")
  async findById(@Param("id", ParseUUIDPipe) id: string) {
    return this.tripService.findById(id);
  }

  @Post()
  async create(@Body() dto: any) {
    return this.tripService.createTrip(dto);
  }

  @Patch(":id")
  async update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: any) {
    return this.tripService.updateTrip(id, dto);
  }

  @Delete(":id")
  async delete(@Param("id", ParseUUIDPipe) id: string) {
    await this.tripService.deleteTrip(id);
    return { success: true };
  }
}
