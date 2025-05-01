import { isNotEmpty, IsNotEmpty, isNumber, IsNumber } from "class-validator";

export class CreateProductDto {
    @IsNotEmpty()
    @IsNumber()
    category_id: number

    @IsNotEmpty()
    size: string

    @IsNotEmpty()
    description: string

    @IsNotEmpty()
    net_weight: string

    @IsNotEmpty()
    @IsNumber()
    kg: number

    @IsNotEmpty()
    made_in: string

    @IsNotEmpty()
    @IsNumber()
    price: number

    @IsNotEmpty()
    @IsNumber()
    stock: number
}
