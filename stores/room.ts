import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useNuxtApp } from '#app'
import { ref as dbRef, onValue, set, update, push, remove } from 'firebase/database'

export interface Song {
    id: string
    youtubeId: string
    title: string
    addedBy: string
    addedAt: number
    thumbnail?: string
}

export interface RoomState {
    roomId: string
    roomName: string
    createdAt: number
    queue: Record<string, Song> // Firebase stores arrays as objects with keys often
    currentSong: Song | null
    isPlaying: boolean
    users: Record<string, { name: string, joinedAt: number }>
    apiKey?: string // Shared API Key
}

export const useRoomStore = defineStore('room', () => {
    const { $db } = useNuxtApp()

    const roomId = ref<string | null>(null)
    const roomName = ref<string>('')
    const queue = ref<Song[]>([])
    const currentSong = ref<Song | null>(null)
    const isPlaying = ref(false)
    const users = ref<{ name: string }[]>([])
    const userName = ref('')
    const isHost = ref(false)
    const roomApiKey = ref<string | undefined>(undefined)

    // Listeners
    let unsubscribeRoom: (() => void) | null = null

    async function joinRoom(id: string, name: string) {
        roomId.value = id
        userName.value = name

        // Check if room exists first? (Optional optimization)
        // For now we subscribe and see.

        const roomRef = dbRef($db, `rooms/${id}`)

        unsubscribeRoom = onValue(roomRef, (snapshot) => {
            const data = snapshot.val() as RoomState
            if (data) {
                roomName.value = data.roomName || ''
                roomApiKey.value = data.apiKey

                // Convert queue object to array if needed
                if (data.queue) {
                    queue.value = Object.values(data.queue).sort((a, b) => a.addedAt - b.addedAt)
                } else {
                    queue.value = []
                }

                currentSong.value = data.currentSong || null
                isPlaying.value = data.isPlaying || false

                // Users handling
                if (data.users) {
                    users.value = Object.values(data.users)
                }
            } else {
                // Room might not exist or deleted
                // Handle error?
            }
        })

        // Add user to room
        // Use push for unique user entry or set by ID if consistent ID
        const userRef = push(dbRef($db, `rooms/${id}/users`));
        await set(userRef, {
            name: name,
            joinedAt: Date.now()
        })
    }

    async function createRoom(name: string, hostName: string) {
        // Generate short 6-char ID
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
        let id = ''
        for (let i = 0; i < 6; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length))
        }

        // Ensure uniqueness could be added here, but rare collision for now.
        const roomRef = dbRef($db, `rooms/${id}`)

        await set(roomRef, {
            roomId: id,
            roomName: name,
            createdAt: Date.now(),
            isPlaying: false,
            currentSong: null,
            queue: {},
            users: {}
        })

        // Join as host
        isHost.value = true
        return id
    }

    async function addSong(song: Omit<Song, 'id' | 'addedAt'>) {
        if (!roomId.value) return
        const queueRef = dbRef($db, `rooms/${roomId.value}/queue`)
        const songRef = push(queueRef)
        await set(songRef, {
            ...song,
            id: songRef.key,
            addedAt: Date.now()
        })
    }

    async function removeSong(songId: string) {
        if (!roomId.value) return
        // Find the key in the queue object map... wait, we need the firebase key.
        // If we stored id as the key, easier. In addSong we used push, so songRef.key is the ID.
        // So song.id IS the key.
        await remove(dbRef($db, `rooms/${roomId.value}/queue/${songId}`))
    }

    async function setPlaying(playing: boolean) {
        if (!roomId.value) return
        await update(dbRef($db, `rooms/${roomId.value}`), { isPlaying: playing })
    }

    async function nextSong() {
        if (!roomId.value || queue.value.length === 0) return

        const next = queue.value[0]
        if (!next) return

        // Move next to current
        await update(dbRef($db, `rooms/${roomId.value}`), {
            currentSong: next,
            isPlaying: true // Auto play
        })

        // Remove from queue
        await removeSong(next.id)
    }

    async function setRoomApiKey(key: string | null) {
        if (!roomId.value) return
        if (key) {
            await update(dbRef($db, `rooms/${roomId.value}`), { apiKey: key })
        } else {
            await remove(dbRef($db, `rooms/${roomId.value}/apiKey`))
        }
    }

    // Global Song Cache (Community Library)
    async function cacheSong(song: { youtubeId: string, title: string, thumbnail?: string, url?: string }) {
        // We use a global 'songs' node, not per room
        const songRef = dbRef($db, `songs/${song.youtubeId}`)

        await update(songRef, {
            ...song,
            url: song.url || `https://www.youtube.com/watch?v=${song.youtubeId}`,
            lastPlayed: Date.now()
        })
    }

    return {
        roomId,
        roomName,
        queue,
        currentSong,
        isPlaying,
        userName,
        isHost,
        users,
        roomApiKey,
        createRoom,
        joinRoom,
        addSong,
        removeSong,
        setPlaying,
        nextSong,
        cacheSong,
        setRoomApiKey
    }
})
