import { axiosInstance } from './axiosInstance.js';
import { ENDPOINTS } from './endpoints.js';

export const tasksApi = {
  async getTasks(projectId) {
    const res = await axiosInstance.get(ENDPOINTS.TASKS(projectId));
    return res.data.data;
  },

  async createTask(projectId, taskData) {
    // If taskData is FormData (attachments), set appropriate header or let Axios handle boundary
    const headers = taskData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const res = await axiosInstance.post(ENDPOINTS.TASKS(projectId), taskData, { headers });
    return res.data.data;
  },

  async getTaskById(projectId, taskId) {
    const res = await axiosInstance.get(ENDPOINTS.TASK_BY_ID(projectId, taskId));
    return res.data.data;
  },

  async updateTask(projectId, taskId, data) {
    const res = await axiosInstance.put(ENDPOINTS.TASK_BY_ID(projectId, taskId), data);
    return res.data.data;
  },

  async deleteTask(projectId, taskId) {
    const res = await axiosInstance.delete(ENDPOINTS.TASK_BY_ID(projectId, taskId));
    return res.data.data;
  },

  async createSubtask(projectId, taskId, data) {
    const res = await axiosInstance.post(ENDPOINTS.SUBTASKS(projectId, taskId), data);
    return res.data.data;
  },

  async updateSubtask(projectId, subTaskId, data) {
    const res = await axiosInstance.put(ENDPOINTS.SUBTASK_BY_ID(projectId, subTaskId), data);
    return res.data.data;
  },

  async deleteSubtask(projectId, subTaskId) {
    const res = await axiosInstance.delete(ENDPOINTS.SUBTASK_BY_ID(projectId, subTaskId));
    return res.data.data;
  },
};
