import {Line} from "@/interfaces/Line";

export class Bucket {
    index!: number;
    overflow!: Bucket | undefined;
    lines!: Line[];
}