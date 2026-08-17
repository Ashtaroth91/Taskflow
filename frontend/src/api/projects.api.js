import { axiosInstance } from './axiosInstance.js';
import { ENDPOINTS } from './endpoints.js';

export const projectsApi = {
  async getProjects() {
    const res = await axiosInstance.get(ENDPOINTS.PROJECTS);
    return res.data.data;
  },

  async createProject(data) {
    const res = await axiosInstance.post(ENDPOINTS.PROJECTS, data);
    return res.data.data;
  },

  async getProjectById(projectId) {
    const res = await axiosInstance.get(ENDPOINTS.PROJECT_BY_ID(projectId));
    return res.data.data;
  },

  async updateProject(projectId, data) {
    const res = await axiosInstance.put(ENDPOINTS.PROJECT_BY_ID(projectId), data);
    return res.data.data;
  },

  async deleteProject(projectId) {
    const res = await axiosInstance.delete(ENDPOINTS.PROJECT_BY_ID(projectId));
    return res.data.data;
  },

  async getMembers(projectId) {
    const res = await axiosInstance.get(ENDPOINTS.PROJECT_MEMBERS(projectId));
    return res.data.data;
  },

  async addMember(projectId, data) {
    const res = await axiosInstance.post(ENDPOINTS.PROJECT_MEMBERS(projectId), data);
    return res.data.data;
  },

  async updateMemberRole(projectId, userId, data) {
    const res = await axiosInstance.put(
      ENDPOINTS.PROJECT_MEMBER_BY_ID(projectId, userId),
      data
    );
    return res.data.data;
  },

  async removeMember(projectId, userId) {
    const res = await axiosInstance.delete(
      ENDPOINTS.PROJECT_MEMBER_BY_ID(projectId, userId)
    );
    return res.data.data;
  },
};
