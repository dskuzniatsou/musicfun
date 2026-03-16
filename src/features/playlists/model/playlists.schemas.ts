import * as z from "zod";
import {currentUserReactionSchema, imagesSchema, tagSchema, userSchema} from "@/common/schemas/schemas.ts";
export const createPlaylistSchema = z.object({
    title: z
        .string()
        .min(1, 'The title length must be more than 1 character')
        .max(100, 'The title length must be less than 100 characters'),
    description: z.string().max(1000, 'The description length must be less than 1000 characters.'),
})
export const playlistMetaSchema = z.object({
    page: z.int().positive(),
    pageSize: z.int().positive(),
    totalCount: z.int().positive(),
    pagesCount: z.int().positive(),
})

export const playlistAttributesSchema = z.object({
    title: z.string(),
    // description: z.string(),
    addedAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    order: z.int(),
    dislikesCount: z.int().nonnegative(),
    likesCount: z.int().nonnegative(),
    tags: z.array(tagSchema),
    images: imagesSchema,
    user: userSchema,
    currentUserReaction: currentUserReactionSchema,
    tracksCount: z.number(),
    duration: z.number(),
})

export const playlistDataSchema = z.object({
    id: z.string(),
    type: z.literal('playlists'),
    attributes: playlistAttributesSchema,
})

export const playlistsResponseSchema = z.object({
    data: z.array(playlistDataSchema),
    meta: playlistMetaSchema,
})
export const playlistCreateResponseSchema = z.object({
    data: playlistDataSchema,
})


// "data": [
//     {
//         "id": "string",
//         "type": "playlists",
//         "attributes": {
//             "title": "string",
//             "addedAt": "2026-03-16T19:39:18.561Z",
//             "updatedAt": "2026-03-16T19:39:18.561Z",
//             "order": 0,
//             "user": {
//                 "id": "string",
//                 "name": "string"
//             },
//             "images": {
//                 "main": [
//                     {
//                         "type": "original",
//                         "width": 0,
//                         "height": 0,
//                         "fileSize": 0,
//                         "url": "string"
//                     }
//                 ]
//             },
//             "tags": [
//                 {
//                     "id": "string",
//                     "name": "string"
//                 }
//             ],
//             "likesCount": 0,
//             "dislikesCount": 0,
//             "currentUserReaction": 0,
//             "tracksCount": 0,
//             "duration": 0
//         }
//     }
// ],
//     "meta": {
//     "totalCount": 0,
//         "page": 0,
//         "pageSize": 0,
//         "pagesCount": 0
// }
// }

