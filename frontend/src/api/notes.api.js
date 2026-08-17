import { axiosInstance } from './axiosInstance.js';
import { ENDPOINTS } from './endpoints.js';

export const notesApi = {
  async getNotes(projectId) {
    const res = await axiosInstance.get(ENDPOINTS.NOTES(projectId));
    return res.data.data;
  },

  async createNote(projectId, data) {
    const res = await axiosInstance.post(ENDPOINTS.NOTES(projectId), data);
    return res.data.data;
  },

  async getNoteById(projectId, noteId) {
    const res = await axiosInstance.get(ENDPOINTS.NOTE_BY_ID(projectId, noteId));
    return res.data.data;
  },

  async updateNote(projectId, noteId, data) {
    const res = await axiosInstance.put(ENDPOINTS.NOTE_BY_ID(projectId, noteId), data);
    return res.data.data;
  },

  async deleteNote(projectId, noteId) {
    const res = await axiosInstance.delete(ENDPOINTS.NOTE_BY_ID(projectId, noteId));
    return res.data.data;
  },
};
