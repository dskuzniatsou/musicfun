// Во избежание ошибок импорт должен быть из `@reduxjs/toolkit/query/react`
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
    CreatePlaylistArgs,
    // FetchPlaylistsArgs,
    PlaylistData,
    PlaylistsResponse, UpdatePlaylistArgs
} from "@/features/playlists/api/playlistsApi.types.ts";

// `createApi` - функция из `RTK Query`, позволяющая создать объект `API`
// для взаимодействия с внешними `API` и управления состоянием приложения
export const playlistsApi = createApi({
    tagTypes: ['Playlist'],
    // `reducerPath` - имя куда будут сохранены состояние и экшены для этого `API`
    reducerPath: 'playlistsApi',
    // `baseQuery` - конфигурация для `HTTP-клиента`, который будет использоваться для отправки запросов
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
    // `endpoints` - метод, возвращающий объект с эндпоинтами для `API`, описанными
    // с помощью функций, которые будут вызываться при вызове соответствующих методов `API`
    // (например `get`, `post`, `put`, `patch`, `delete`)
    endpoints: build => ({
        // Типизация аргументов (<возвращаемый тип, тип query аргументов (`QueryArg`)>)
        // `query` по умолчанию создает запрос `get` и указание метода необязательно
        fetchPlaylists: build.query<PlaylistsResponse, void>({
            query: () => {
                return {
                    method: 'get',
                    url: `playlists`,
                }
            },
            providesTags: ['Playlist'],
        }),
        createPlaylist: build.mutation<{ data: PlaylistData }, CreatePlaylistArgs>({
            query: (args) => ({
                url: 'playlists',
                method: 'post',
                body: {
                    data: {
                        type: 'playlists', // возможно, это константа – уточните по документации
                        attributes: {
                            title: args.title,
                            description: args.description,
                        },
                    },
                },
            }),
            invalidatesTags: ['Playlist'],
        }),
        deletePlaylist: build.mutation<void, string>({
            query: playlistId => ({
                url: `playlists/${playlistId}`,
                method: 'delete',
            }),
            invalidatesTags: ['Playlist'],
        }),
        updatePlaylist: build.mutation<void, { playlistId: string; body: UpdatePlaylistArgs }>({
            query: ({ playlistId, body }) => ({
                url: `playlists/${playlistId}`,
                method: 'put',
                body,
            }),
            invalidatesTags: ['Playlist'],
        }),
    }),
})

// `createApi` создает объект `API`, который содержит все эндпоинты в виде хуков,
// определенные в свойстве `endpoints`
export const { useFetchPlaylistsQuery, useCreatePlaylistMutation, useDeletePlaylistMutation, useUpdatePlaylistMutation  } = playlistsApi

