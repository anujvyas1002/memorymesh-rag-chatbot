import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CommonResponseDto } from '../../../common/dto/common-response.dto';
import { ListQueryParamDto } from '../../../common/dto/list-query-param.dto';
import { ListResponseDto } from '../../../common/dto/list-response.dto';
import { AppException } from '../../../common/exceptions/app.exception';
import { DocumentResponseDto } from '../dto/document-response.dto';
import { IngestDocumentDto } from '../dto/ingest-document.dto';
import { UploadDocumentDto } from '../dto/upload-document.dto';
import { DocumentService } from '../services/document.service';
import { FileExtractionService } from '../services/file-extraction.service';

@ApiTags('documents')
@ApiSecurity('api-key')
@Controller('documents')
export class DocumentController {
  private static readonly MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

  private static readonly ALLOWED_MIME = ['text/plain', 'text/markdown', 'application/json', 'application/pdf'];

  constructor(
    private readonly documentService: DocumentService,
    private readonly fileExtractionService: FileExtractionService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Ingest a raw-text document (chunk + embed + store).' })
  public async ingest(@Body() dto: IngestDocumentDto): Promise<CommonResponseDto<DocumentResponseDto>> {
    const document = await this.documentService.ingest(dto);
    return CommonResponseDto.created(DocumentResponseDto.fromEntity(document), 'Document ingested');
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload a .txt / .md / .json / .pdf file to ingest.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
        title: { type: 'string' },
        source: { type: 'string' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  public async upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: UploadDocumentDto,
  ): Promise<CommonResponseDto<DocumentResponseDto>> {
    if (file === undefined) {
      throw new AppException('A file is required under the "file" field', 400);
    }
    if (file.size > DocumentController.MAX_UPLOAD_BYTES) {
      throw new AppException('File exceeds the 5MB limit', 413);
    }
    if (!DocumentController.ALLOWED_MIME.includes(file.mimetype)) {
      throw new AppException(`Unsupported file type: ${file.mimetype}`, 415);
    }

    const content = await this.fileExtractionService.extract(file);

    const document = await this.documentService.ingest({
      title: dto.title ?? file.originalname,
      content,
      source: dto.source ?? file.originalname,
    });
    return CommonResponseDto.created(DocumentResponseDto.fromEntity(document), 'Document ingested');
  }

  @Get()
  @ApiOperation({ summary: 'List ingested documents (paginated).' })
  public async list(
    @Query() query: ListQueryParamDto,
  ): Promise<CommonResponseDto<ListResponseDto<DocumentResponseDto>>> {
    const skip = query.skip ?? 0;
    const take = query.take ?? 50;
    const [items, total] = await this.documentService.list(skip, take);
    const list = new ListResponseDto(
      items.map((item): DocumentResponseDto => DocumentResponseDto.fromEntity(item)),
      total,
    );
    return CommonResponseDto.ok(list, 'Documents fetched');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch a single document by id.' })
  public async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CommonResponseDto<DocumentResponseDto>> {
    const document = await this.documentService.findOne(id);
    return CommonResponseDto.ok(DocumentResponseDto.fromEntity(document), 'Document fetched');
  }

  @Post(':id/reprocess')
  @ApiOperation({ summary: 'Re-chunk and re-embed an existing document.' })
  public async reprocess(@Param('id', ParseUUIDPipe) id: string): Promise<CommonResponseDto<DocumentResponseDto>> {
    const document = await this.documentService.reprocess(id);
    return CommonResponseDto.ok(DocumentResponseDto.fromEntity(document), 'Document reprocessed');
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete a document and all of its chunks.' })
  public async remove(@Param('id', ParseUUIDPipe) id: string): Promise<CommonResponseDto<null>> {
    await this.documentService.remove(id);
    return CommonResponseDto.ok(null, 'Document deleted');
  }
}
