import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CommonResponseDto } from '../../../common/dto/common-response.dto';
import { ListQueryParamDto } from '../../../common/dto/list-query-param.dto';
import { ListResponseDto } from '../../../common/dto/list-response.dto';
import { AskDto } from '../dto/ask.dto';
import { ChatAnswerResponseDto } from '../dto/chat-answer-response.dto';
import { ConversationResponseDto } from '../dto/conversation-response.dto';
import { ChatService } from '../services/chat.service';

@ApiTags('chat')
@ApiSecurity('api-key')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('ask')
  @HttpCode(200)
  @ApiOperation({ summary: 'Ask a question; retrieves context and generates a grounded answer.' })
  public async ask(@Body() dto: AskDto): Promise<CommonResponseDto<ChatAnswerResponseDto>> {
    const answer = await this.chatService.ask(dto);
    return CommonResponseDto.ok(ChatAnswerResponseDto.fromModel(answer), 'Answer generated');
  }

  @Get('conversations')
  @ApiOperation({ summary: 'List conversations (paginated).' })
  public async listConversations(
    @Query() query: ListQueryParamDto,
  ): Promise<CommonResponseDto<ListResponseDto<ConversationResponseDto>>> {
    const skip = query.skip ?? 0;
    const take = query.take ?? 50;
    const [items, total] = await this.chatService.listConversations(skip, take);
    const list = new ListResponseDto(
      items.map((item): ConversationResponseDto => ConversationResponseDto.fromEntity(item)),
      total,
    );
    return CommonResponseDto.ok(list, 'Conversations fetched');
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Fetch a conversation with its full message history.' })
  public async getConversation(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CommonResponseDto<ConversationResponseDto>> {
    const conversation = await this.chatService.getConversation(id);
    return CommonResponseDto.ok(ConversationResponseDto.fromEntity(conversation), 'Conversation fetched');
  }

  @Delete('conversations/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete a conversation and its messages.' })
  public async removeConversation(@Param('id', ParseUUIDPipe) id: string): Promise<CommonResponseDto<null>> {
    await this.chatService.removeConversation(id);
    return CommonResponseDto.ok(null, 'Conversation deleted');
  }
}
