import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/**
 * Memória local de bloqueios (ISSUE FE-010).
 *
 * O backend não expõe quem está bloqueado (não há GET de bloqueados nem
 * `is_blocked` no perfil), pelo que a UI não consegue reconstruir esse estado
 * ao recarregar. Esta store guarda, por utilizador autenticado, os ids que ele
 * bloqueou NESTE browser — alimentada pelos sucessos de block/unblock e pela
 * resposta "já está bloqueado" da API.
 *
 * Limitação assumida: bloqueios feitos noutro dispositivo/browser não aparecem
 * aqui (o perfil continua a resolvê-los via 400 → "Desbloquear"). A correção
 * definitiva é o backend expor o estado de bloqueio.
 */

interface BlockedState {
    // ids bloqueados, indexados pelo id do utilizador que bloqueia
    byUser: Record<number, number[]>
    addBlocked: (blockerId: number, blockedId: number) => void
    removeBlocked: (blockerId: number, blockedId: number) => void
    isBlocked: (blockerId: number | undefined, blockedId: number) => boolean
}

export const useBlockedStore = create<BlockedState>()(
    persist(
        (set, get) => ({
            byUser: {},
            addBlocked: (blockerId, blockedId) =>
                set((state) => {
                    const current = state.byUser[blockerId] || []
                    if (current.includes(blockedId)) return state
                    return { byUser: { ...state.byUser, [blockerId]: [...current, blockedId] } }
                }),
            removeBlocked: (blockerId, blockedId) =>
                set((state) => ({
                    byUser: {
                        ...state.byUser,
                        [blockerId]: (state.byUser[blockerId] || []).filter((id) => id !== blockedId),
                    },
                })),
            isBlocked: (blockerId, blockedId) =>
                blockerId !== undefined && (get().byUser[blockerId] || []).includes(blockedId),
        }),
        {
            name: 'bidlive-blocked-users',
            storage: createJSONStorage(() => localStorage),
        }
    )
)
