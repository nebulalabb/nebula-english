import axiosClient from '../axios';

export interface NoteItem {
    id: string;
    title: string;
    sourceType: string;
    wordCount: number;
    createdAt: string;
}

export interface NoteSummary {
    id: string;
    summaryShort: string;
    bulletPoints: string[];
    keywords: string[];
}

export const notesService = {
    getNotes: async (page = 1, limit = 20) => {
        const res = await axiosClient.get('/notes', { params: { page, limit } });
        return res.data;
    },

    getNoteDetail: async (noteId: string) => {
        const res = await axiosClient.get(`/notes/${noteId}`);
        return res.data.data;
    },

    summarize: async (data: { content: string; title?: string }) => {
        const res = await axiosClient.post('/notes/summarize', data);
        return res.data;
    },

    updateNote: async (noteId: string, data: any) => {
        const res = await axiosClient.patch(`/notes/${noteId}`, data);
        return res.data;
    },

    deleteNote: async (noteId: string) => {
        const res = await axiosClient.delete(`/notes/${noteId}`);
        return res.data;
    }
};
