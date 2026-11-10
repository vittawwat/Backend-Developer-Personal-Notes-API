import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Note } from './note.entity';
import { Repository } from 'typeorm';
import { CreateNoteDto } from './dtos/createNote.dto';
import { EditNoteDto } from './dtos/editNote.dto';
import { GetNotesDto } from './dtos/get-notes.dto';
import { Brackets } from 'typeorm';

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
            }
        })

        if (!note) {
            throw new NotFoundException();
        }

        return note

    }
    async editNote(userId: string, noteId: string, EditNoteData: EditNoteDto): Promise<Note> {

        const { title, content, is_pinned } = EditNoteData
        const note = await this.getNoteOwner(userId, noteId);

        Object.assign(note, EditNoteData)

        return await this.notesRepository.save(note)
    }
    async deleteNote(userId: string, noteId: string) {
        // console.log(userId,noteId);
        const note = await this.getNoteOwner(userId, noteId);

        await this.notesRepository.delete(noteId)

        return
    }
    async getNotes(userId: string, query: GetNotesDto) {
        const { page, limit } = query;
        const skip = (page - 1) * limit;

        // Base query: get notes belonging to the user
        const queryBuilder = this.notesRepository
            .createQueryBuilder('note')
            .where('note.user_id = :userId', { userId });

        // Filter by pinned status
        if (query.is_pinned !== undefined) {
            queryBuilder.andWhere('note.is_pinned = :isPinned', {
                isPinned: query.is_pinned,
            });
        }

        // Search by title and content
        if (query.search?.trim()) {
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where('note.title ILIKE :search')
                        .orWhere('note.content ILIKE :search');
                }),
                { search: `%${query.search.trim()}%` },
            );
        }

        // Sort
        const sort = query.sort ?? '-created_at';

        const sortMap: Record<string, string> = {
            created_at: 'note.created_at',
            title: 'note.title', 
        };

        const sortField = sort.replace('-', '');
        const sortOrder = sort.startsWith('-') ? 'DESC' : 'ASC';

        // Pagination and execute query
        const [notes, total] = await queryBuilder
            .orderBy(sortMap[sortField], sortOrder)
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return {
            data: notes,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }


}
