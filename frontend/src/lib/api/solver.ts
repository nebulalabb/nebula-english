import axiosClient from '../axios';

export interface SolveHistory {
    id: string;
    subject: string;
    gradeLevel?: string;
    questionText: string;
    questionImageUrl?: string;
    answerText: string;
    answerHtml?: string;
    tokensUsed: number;
    modelUsed: string;
    isSaved: boolean;
    createdAt: string;
}

export const solverService = {
    solve: async (data: { question: string; subject?: string; gradeLevel?: string }) => {
        const res = await axiosClient.post('/solver/solve', data);
        return res.data;
    },

    solveImage: async (formData: FormData) => {
        const res = await axiosClient.post('/solver/solve/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    },

    followUp: async (historyId: string, question: string) => {
        const res = await axiosClient.post(`/solver/${historyId}/followup`, { question });
        return res.data;
    },

    getHistory: async (page = 1, limit = 20): Promise<{ data: SolveHistory[], total: number }> => {
        const res = await axiosClient.get(`/solver/history`, { params: { page, limit } });
        return res.data;
    },

    getHistoryDetail: async (historyId: string): Promise<SolveHistory> => {
        const res = await axiosClient.get(`/solver/history/${historyId}`);
        return res.data.data;
    },

    deleteHistory: async (historyId: string) => {
        const res = await axiosClient.delete(`/solver/history/${historyId}`);
        return res.data;
    }
};
