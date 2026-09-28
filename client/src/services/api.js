import axios from "axios";

export const api = axios.create({ baseURL: "https://toilet-management-system.onrender.com/api" });

export async function list(resource) {
  const { data } = await api.get(`/${resource}`);
  return data;
}
export async function create(resource, payload) {
  const { data } = await api.post(`/${resource}`, payload);
  return data;
}
export async function update(resource, id, payload) {
  const { data } = await api.put(`/${resource}/${id}`, payload);
  return data;
}
export async function remove(resource, id) {
  const { data } = await api.delete(`/${resource}/${id}`);
  return data;
}
