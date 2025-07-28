// src/catalog/dto/list-tyres.dto.ts
import { IsInt, IsOptional, IsPositive, IsString } from "class-validator";
import { Type } from "class-transformer";

export class ListTyresDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() type?: string; // Added type for tyre type filtering
  @IsOptional() @IsString() size?: string;
  @IsOptional() @IsString() season?: string;
  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsString() model?: string;

  @IsOptional() @Type(() => Number) @IsInt() @IsPositive() page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @IsPositive() limit?: number = 24;
  @IsOptional() @IsString() sort?: "relevance" | "price" = "relevance";
}
