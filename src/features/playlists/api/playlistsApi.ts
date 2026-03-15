// Во избежание ошибок импорт должен быть из `@reduxjs/toolkit/query/react`
// import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import type {
    CreatePlaylistArgs, FetchPlaylistsArgs,
    // FetchPlaylistsArgs,
    PlaylistData,
    PlaylistsResponse, UpdatePlaylistArgs
} from "@/features/playlists/api/playlistsApi.types.ts";
import {baseApi} from "@/app/api/baseApi.ts";
import type {Images} from "@/common/types";

// `createApi` - функция из `RTK Query`, позволяющая создать объект `API`
// для взаимодействия с внешними `API` и управления состоянием приложения
export const playlistsApi = baseApi.injectEndpoints({
    // tagTypes: ['Playlist'],
    // // `reducerPath` - имя куда будут сохранены состояние и экшены для этого `API`
    // reducerPath: 'playlistsApi',
    // // `baseQuery` - конфигурация для `HTTP-клиента`, который будет использоваться для отправки запросов
    // baseQuery: fetchBaseQuery({
    //     baseUrl: import.meta.env.VITE_BASE_URL,
    //     headers: {
    //         'API-KEY': import.meta.env.VITE_API_KEY,
    //     },
    //     prepareHeaders: headers => {
    //
    //         headers.set('Authorization', `Bearer ${import.meta.env.VITE_ACCESS_TOKEN}`)
    //         return headers
    //     },
    // }),
    // `endpoints` - метод, возвращающий объект с эндпоинтами для `API`, описанными
    // с помощью функций, которые будут вызываться при вызове соответствующих методов `API`
    // (например `get`, `post`, `put`, `patch`, `delete`)
    endpoints: build => ({
        // Типизация аргументов (<возвращаемый тип, тип query аргументов (`QueryArg`)>)
        // `query` по умолчанию создает запрос `get` и указание метода необязательно
        // fetchPlaylists: build.query<PlaylistsResponse, void>({
            fetchPlaylists: build.query<PlaylistsResponse, FetchPlaylistsArgs>({
                query: params => ({ url: `/playlists`, params }),
                // query: ({ search, ...params }) => ({
                //     url: 'playlists',
                //     params: search ? { ...params, 'filter[title]': search } : params,
                // }),
                providesTags: ['Playlist'],
            }),
            // query: () => {
            //     return {
            //         method: 'get',
            //         url: `playlists`,
            //
            //     }
            // },
            // providesTags: ['Playlist'],
        // }),
        createPlaylist: build.mutation<{ data: PlaylistData }, CreatePlaylistArgs>({
            query: (args) => ({
                url: '/playlists',
                method: 'post',
                // body
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
                url: `/playlists/${playlistId}`,
                method: 'delete',
            }),
            invalidatesTags: ['Playlist'],
        }),
        updatePlaylist: build.mutation<void, { playlistId: string; body: UpdatePlaylistArgs }>({
            query: ({playlistId, body}) => ({
                url: `/playlists/${playlistId}`,
                method: 'put',
                // body
                body: {
                    data: {
                        type: 'playlists',
                        attributes: {
                            title: body.title,
                            description: body.description,
                            tagIds: body.tagIds, // если API поддерживает обновление тегов
                        },
                    },
                },
                async onQueryStarted({ playlistId, body }, { dispatch, queryFulfilled, getState }) {
                    const args = playlistsApi.util.selectCachedArgsForQuery(getState(), 'fetchPlaylists')

                    const patchResults: any[] = []

                    args.forEach(arg => {
                        patchResults.push(
                            dispatch(
                                playlistsApi.util.updateQueryData(
                                    'fetchPlaylists',
                                    {
                                        pageNumber: arg.pageNumber,
                                        pageSize: arg.pageSize,
                                        search: arg.search,
                                    },
                                    state => {
                                        const index = state.data.findIndex(playlist => playlist.id === playlistId)
                                        if (index !== -1) {
                                            state.data[index].attributes = { ...state.data[index].attributes, ...body }
                                        }
                                    }
                                )
                            )
                        )
                    })

                    try {
                        await queryFulfilled
                    } catch {
                        patchResults.forEach(patchResult => {
                            patchResult.undo()
                        })
                    }
                },
            invalidatesTags: ['Playlist'],
        }),
        }),
        uploadPlaylistCover: build.mutation<Images, { playlistId: string; file: File }>({
            query: ({playlistId, file}) => {
                const formData = new FormData()
                formData.append('file', file)
                return {
                    url: `/playlists/${playlistId}/images/main`,
                    method: 'post',
                    body: formData,
                }
            },
            invalidatesTags: ['Playlist'],
        }),
        deletePlaylistCover: build.mutation<void, { playlistId: string }>({
            query: ({playlistId}) => ({url: `/playlists/${playlistId}/images/main`, method: 'delete'}),
            invalidatesTags: ['Playlist'],
        }),
    }),
})

// `createApi` создает объект `API`, который содержит все эндпоинты в виде хуков,
// определенные в свойстве `endpoints`
export const {
    useFetchPlaylistsQuery,
    useCreatePlaylistMutation,
    useDeletePlaylistMutation,
    useUpdatePlaylistMutation,
    useUploadPlaylistCoverMutation,
    useDeletePlaylistCoverMutation
} = playlistsApi

