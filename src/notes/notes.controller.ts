import { Body, Controller, Get, Param, Patch, 
    Post, UseGuards, Req, Delete, HttpCode, Query
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dtos/createNote.dto';
import { Note } from './note.entity';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { request } from 'http';
import { EditNoteDto } from './dtos/editNote.dto';
import { GetNotesDto } from './dtos/get-notes.dto';

@Controller('notes')
export class NotesController {
    constructor(private readonly notesService: NotesService) { }

    @UseGuards(AuthGuard)
    @Post()
    async createNote(
        @CurrentUser() user: { userId: string },
        @Body() createNoteData: CreateNoteDto): Promise<Note> {
        return await this.notesService.createNote(user.userId, createNoteData);
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    async getNoteOwner(
        @CurrentUser() user: { userId: string },
        @Param('id') id: string): Promise<Note> {
        return await this.notesService.getNoteOwner(user.userId, id);
    }

    @UseGuards(AuthGuard)
    @Patch(':id')
    async editNote(
        @CurrentUser() user: { userId: string },
        @Param('id') id: string,
        @Body() EditNoteData: EditNoteDto): Promise<Note> {
        return await this.notesService.editNote(user.userId, id, EditNoteData);
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    @HttpCode(204)
    async deleteNote(
        @CurrentUser() user: { userId: string },
        @Param('id') id: string,) {
        return await this.notesService.deleteNote(user.userId, id);
    }

    @UseGuards(AuthGuard)
    @Get()
    getNotes(
        @CurrentUser() user: { userId: string },
        @Query() query: GetNotesDto,
    ) {
        // console.log("route getnotes",query);
        // console.log(query.is_pinned, typeof query.is_pinned);
        return this.notesService.getNotes(user.userId, query);
    }
}
