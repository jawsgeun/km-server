import { ApiProperty } from '@nestjs/swagger';

export class PaginationResponseDto {
  @ApiProperty({ description: '현재 페이지' })
  currentPage: number;
  @ApiProperty({ description: '페이지 당 아이템 수' })
  sizePerPage: number;
  @ApiProperty({ description: '총 페이지 수' })
  totalPageSize: number;
  @ApiProperty({ description: '총 아이템 갯수' })
  totalItemCount: number;
}

export class CommonPostResponse {
  @ApiProperty()
  message: string;
}

export function convertToPaginationDto(
  totalCount: number,
  currentPage: number,
  sizePerPage: number,
): PaginationResponseDto {
  return {
    currentPage,
    sizePerPage,
    totalPageSize: Math.ceil(totalCount / sizePerPage),
    totalItemCount: totalCount,
  };
}

interface BranchSession {
  id: string;
  dateSessionCreated: string;
}

export interface SessionType {
  cookie: Record<string, any>;
  LoggedInBranch?: BranchSession;
}

export interface LoggedInSessionType {
  cookie: Record<string, any>;
  LoggedInBranch: BranchSession;
}
