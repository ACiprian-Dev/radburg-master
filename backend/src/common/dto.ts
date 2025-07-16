import { $Enums, product } from "@prisma/client";

export class ProductDto implements product {
  id: bigint;
  slug: string;
  brand_id: number;
  model_id: number;
  size_id: number;
  type_id: number;
  bucket_id: number | null;
  dot: string | null;
  created_at: Date;
  updated_at: Date;

  constructor(partial: Partial<ProductDto>) {
    Object.assign(this, partial);
  }
  product_type: $Enums.product_type_enum;
}
