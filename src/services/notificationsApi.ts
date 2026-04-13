import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ENDPOINTS } from '../constants/constants';
import { baseQueryWithReauth } from './baseQuery';

export interface AppNotification {
  _id: string;
  title: string;
  body: string;
  read?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface NotificationsResponse {
  success?: boolean;
  notifications?: AppNotification[];
}

const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Notifications'],
  endpoints: builder => ({
    getNotifications: builder.query<AppNotification[], void>({
      query: () => API_ENDPOINTS.NOTIFICATIONS.LIST,
      providesTags: ['Notifications'],
      transformResponse: (response: NotificationsResponse) =>
        response?.notifications || [],
    }),
    createNotification: builder.mutation<
      { success: boolean },
      { title: string; body: string; source?: string }
    >({
      query: body => ({
        url: API_ENDPOINTS.NOTIFICATIONS.CREATE,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Notifications'],
    }),
    markNotificationRead: builder.mutation<{ success: boolean }, { id: string }>({
      query: ({ id }) => ({
        url: API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id),
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),
    deleteNotification: builder.mutation<{ success: boolean }, { id: string }>({
      query: ({ id }) => ({
        url: API_ENDPOINTS.NOTIFICATIONS.DELETE_ONE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications'],
    }),
    clearAllNotifications: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: API_ENDPOINTS.NOTIFICATIONS.CLEAR_ALL,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications'],
    }),
    deleteSelectedNotifications: builder.mutation<
      { success: boolean },
      { ids: string[] }
    >({
      query: body => ({
        url: API_ENDPOINTS.NOTIFICATIONS.DELETE_SELECTED,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useCreateNotificationMutation,
  useMarkNotificationReadMutation,
  useDeleteNotificationMutation,
  useClearAllNotificationsMutation,
  useDeleteSelectedNotificationsMutation,
} = notificationsApi;

export default notificationsApi;
