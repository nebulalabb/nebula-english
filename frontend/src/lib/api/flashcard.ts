import axiosClient from '../axios';

export interface FlashcardSet {
    id: string;
    title: string;
    description?: string;
    cardCount: number;
    createdAt: string;
    flashcards?: Flashcard[];
}

export interface Flashcard {
    id: string;
    front: string;
    back: string;
    hint?: string;
}

export const flashcardService = {
    getSets: async (page = 1, limit = 20) => {
        const res = await axiosClient.get('/flashcards/sets', { params: { page, limit } });
        return res.data;
    },

    getSetDetail: async (setId: string): Promise<FlashcardSet> => {
        const res = await axiosClient.get(`/flashcards/sets/${setId}`);
        return res.data.data;
    },

    createManual: async (data: any) => {
        const res = await axiosClient.post('/flashcards/sets', data);
        return res.data;
    },

    generateFromText: async (data: { title: string; content: string }) => {
        const res = await axiosClient.post('/flashcards/sets/generate/text', data);
        return res.data;
    },

    updateSet: async (setId: string, data: any) => {
        const res = await axiosClient.patch(`/flashcards/sets/${setId}`, data);
        return res.data;
    },

    deleteSet: async (setId: string) => {
        const res = await axiosClient.delete(`/flashcards/sets/${setId}`);
        return res.data;
    },

    getDueCards: async () => {
        const res = await axiosClient.get('/flashcards/review/due');
        return res.data;
    },

    submitReviews: async (reviews: { flashcardId: string; quality: number }[]) => {
        const res = await axiosClient.post('/flashcards/review/submit', { reviews });
        return res.data;
    }
};
