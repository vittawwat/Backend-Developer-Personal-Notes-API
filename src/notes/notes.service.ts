import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Note } from './note.entity';
import { Repository } from 'typeorm';
import { CreateNoteDto } from './dtos/createNote.dto';
import { EditNoteDto } from './dtos/editNote.dto';

@Injectable()
export class NotesService {
    constructor(
        @InjectRepository(Note)
        private notesRepository: Repository<Note>,
    ) { }

    async createNote(
        userId: string,
        createNoteDto: CreateNoteDto,
    ): Promise<Note> {
        // สร้าง User Object เพื่อใช้เชื่อม Relation กับ User Entity ผ่าน Foreign Key (user_id)
        const user = { id: userId };

        const note = this.notesRepository.create({
            ...createNoteDto,
            user,
        });
        return await this.notesRepository.save(note);
    }

    async getNoteOwner(userId: string, noteId: string): Promise<Note> {

        const note = await this.notesRepository.findOne({ 
            where: { 
                id: noteId,
                user: { id: userId },
            } })

        if (!note) {
            throw new NotFoundException();
        }

        return note
        
    }
    async editNote(userId: string, noteId: string, EditNoteData: EditNoteDto): Promise<Note>{ 

        const { title, content, is_pinned } = EditNoteData
        const note = await this.getNoteOwner(userId, noteId);
    
        Object.assign(note ,EditNoteData)
        
        return await this.notesRepository.save(note)
    }

    async deleteNote(userId: string, noteId: string) {
        // console.log(userId,noteId);
        const note = await this.getNoteOwner(userId, noteId);
        
        await this.notesRepository.delete(noteId)
        
        return
    }
}
