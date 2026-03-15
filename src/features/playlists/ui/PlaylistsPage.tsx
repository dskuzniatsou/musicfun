import {
    useFetchPlaylistsQuery,
} from "@/features/playlists/api/playlistsApi.ts";
import s from './PlaylistsPage.module.css'
import {CreatePlaylistForm} from "@/features/playlists/ui/CreatePlaylistForm/CreatePlaylistForm.tsx";
import {type ChangeEvent, useEffect, useState} from "react";
import {useDebounceValue} from "@/common/hooks";
import {Pagination} from "@/common/components/Pagination/Pagination.tsx";
import {PlaylistsList} from "@/features/playlists/ui/PlaylistsList/PlaylistsList.tsx";
import {LinearProgress} from "@/common/components/LinearProgress/LinearProgress.tsx";
import {toast} from "react-toastify";
export const PlaylistsPage = () => {
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(2)

    const [search, setSearch] = useState('')
    const debounceSearch = useDebounceValue(search)

    const { data, isLoading,  error, isError } = useFetchPlaylistsQuery({
        search: debounceSearch,
        pageNumber: currentPage,
        pageSize,
    },

        // polling позволяет автоматически повторять запросы через определённые интервалы времени для поддержания актуальности данных.
        // {
        //     pollingInterval: 3000,
        //     skipPollingIfUnfocused: true,
        // }
    )

    const changePageSizeHandler = (size: number) => {
        setPageSize(size)
        setCurrentPage(1)
    }

    const searchPlaylistHandler = (e: ChangeEvent<HTMLInputElement>) => {
        setSearch(e.currentTarget.value)
        setCurrentPage(1)
    }
    useEffect(() => {
        if (!error) return
        if ('status' in error) {
            // FetchBaseQueryError
            const errMsg =
                'error' in error
                    ? error.error
                    : (
                        error.data as {
                            error: string
                        }
                    ).error ||
                    (error.data as { message: string }).message ||
                    'Some error occurred'
            toast(errMsg, { type: 'error', theme: 'colored' })
        } else {
            // SerializedError
            toast(error.message || 'Some error occurred', { type: 'error', theme: 'colored' })
        }
    }, [error])

    if (isLoading) return <h1>Skeleton loader...</h1>

    return (
        <div className={s.container}>
            <h1>Playlists page</h1>

            <input
                type="search"
                placeholder={'Search playlist by title'}
                onChange={searchPlaylistHandler}
            />
            <PlaylistsList playlists={data?.data || []} isPlaylistsLoading={isLoading} />

            <Pagination
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                pagesCount={data?.meta.pagesCount || 1}
                pageSize={pageSize}
                changePageSize={changePageSizeHandler}
            />
        </div>
    )
}

