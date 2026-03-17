// Во избежание ошибок импорт должен быть из `@reduxjs/toolkit/query/react`
// import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import type {
    CreatePlaylistArgs, FetchPlaylistsArgs, PlaylistCreatedEvent,
    // FetchPlaylistsArgs,
    PlaylistData,
    PlaylistsResponse, PlaylistUpdatedEvent, UpdatePlaylistArgs
} from "@/features/playlists/api/playlistsApi.types.ts";
import {baseApi} from "@/app/api/baseApi.ts";
import type {Images} from "@/common/types";
import {playlistCreateResponseSchema, playlistsResponseSchema} from "@/features/playlists/model/playlists.schemas.ts";
import {withZodCatch} from "@/common/utils";
import {imagesSchema} from "@/common/schemas/schemas.ts";
import {io, Socket} from "socket.io-client";
import {subscribeToEvent} from "@/common/socket/subscribeToEvent.ts";
import {SOCKET_EVENTS} from "@/common/constants/constants.ts";


export const playlistsApi = baseApi.injectEndpoints({

    endpoints: build => ({
            fetchPlaylists: build.query<PlaylistsResponse, FetchPlaylistsArgs>({
                query: params => ({ url: `playlists`, params }),
                ...withZodCatch(playlistsResponseSchema),
                keepUnusedDataFor: 0, // 👈 очистка сразу после размонтирования
                async onCacheEntryAdded(_arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                    // Ждем разрешения начального запроса перед продолжением
                    await cacheDataLoaded

                    const unsubscribes = [
                        subscribeToEvent<PlaylistCreatedEvent>(SOCKET_EVENTS.PLAYLIST_CREATED, msg => {
                            const newPlaylist = msg.payload.data
                            updateCachedData(state => {
                                state.data.pop()
                                state.data.unshift(newPlaylist)
                                state.meta.totalCount = state.meta.totalCount + 1
                                state.meta.pagesCount = Math.ceil(state.meta.totalCount / state.meta.pageSize)
                            })
                        }),
                        subscribeToEvent<PlaylistUpdatedEvent>(SOCKET_EVENTS.PLAYLIST_UPDATED, msg => {
                            const newPlaylist = msg.payload.data
                            updateCachedData(state => {
                                const index = state.data.findIndex(playlist => playlist.id === newPlaylist.id)
                                if (index !== -1) {
                                    state.data[index] = { ...state.data[index], ...newPlaylist }
                                }
                            })
                        }),
                    ]
                    // const unsubscribe2 = subscribeToEvent<PlaylistUpdatedEvent>(
                    //     SOCKET_EVENTS.PLAYLIST_UPDATED,
                    //     msg => {
                    //         const newPlaylist = msg.payload.data
                    //         updateCachedData(state => {
                    //             const index = state.data.findIndex(playlist => playlist.id === newPlaylist.id)
                    //             if (index !== -1) {
                    //                 state.data[index] = { ...state.data[index], ...newPlaylist }
                    //             }
                    //         })
                    //     }
                    // )
                    // CacheEntryRemoved разрешится, когда подписка на кеш больше не активна
                    await cacheEntryRemoved
                    unsubscribes.forEach(unsubscribe => unsubscribe())

                },
                providesTags: ['Playlist'],
            }),

        createPlaylist: build.mutation<{ data: PlaylistData }, CreatePlaylistArgs>({
            query: (args) => ({
                url: 'playlists',
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
            ...withZodCatch(playlistCreateResponseSchema),
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
            query: ({playlistId, body}) => ({
                url: `playlists/${playlistId}`,
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
                async onQueryStarted({ playlistId, body }, { queryFulfilled, dispatch, getState }) {
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
                    } catch  {
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
            ...withZodCatch(imagesSchema),
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

