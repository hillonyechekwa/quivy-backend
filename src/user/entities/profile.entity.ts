import { ApiProperty } from "@nestjs/swagger";
import { Profile } from "@prisma/client";

export class ProfileEntity implements Profile {
	@ApiProperty()
	id: string;

	@ApiProperty()
	name: string;

	@ApiProperty()
	profileImageUrl: string;

	@ApiProperty()
	fullname: string;

	@ApiProperty()
	phoneNumber: number;

	@ApiProperty()
	address: string;

	@ApiProperty()
	userId: string;
}