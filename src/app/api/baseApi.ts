import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseApi = createApi({
    reducerPath: 'baseApi',
    tagTypes: ['Playlist'],
    // refetchOnReconnect: true, - управляет повторным запросом данных, когда приложение или браузер восстанавливает соединение с интернетом после его потери.
    // keepUnusedDataFor: 5 - время хранения в кэше
    // refetchOnFocus: true, - для автоматического повторного запроса за данными, когда окно приложения или вкладка браузера попадают в фокус.
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_BASE_URL,
        headers: {
            'API-KEY': import.meta.env.VITE_API_KEY,
        },

        prepareHeaders: headers => {
            headers.set('Authorization', `Bearer ${import.meta.env.VITE_ACCESS_TOKEN}`)
            return headers
        },
    }),
    endpoints: () => ({}),
})