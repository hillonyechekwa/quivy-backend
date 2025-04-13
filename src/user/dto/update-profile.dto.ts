import { PartialType } from "@nestjs/swagger"
import { NewProfileDto } from "./new-profile.dto"

export class updateProfileDto extends PartialType(NewProfileDto) {}