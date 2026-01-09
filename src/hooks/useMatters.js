import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockUsptoService } from '@/services/mockUsptoService'

// Query keys
export const queryKeys = {
  matters: ['matters'],
  matter: (id) => ['matter', id],
  clients: ['clients'],
  deadlines: (filters) => ['deadlines', filters],
  kpiSummary: ['kpi-summary'],
  ttabProceedings: (matterId) => ['ttab', matterId],
}

/**
 * Fetch all matters
 */
export function useMatters() {
  return useQuery({
    queryKey: queryKeys.matters,
    queryFn: () => mockUsptoService.getMatters(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch a single matter by ID
 */
export function useMatter(id) {
  return useQuery({
    queryKey: queryKeys.matter(id),
    queryFn: () => mockUsptoService.getMatterById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Fetch all clients
 */
export function useClients() {
  return useQuery({
    queryKey: queryKeys.clients,
    queryFn: () => mockUsptoService.getClients(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Fetch deadlines with optional filters
 */
export function useDeadlines(filters = {}) {
  return useQuery({
    queryKey: queryKeys.deadlines(filters),
    queryFn: () => mockUsptoService.getDeadlines(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Fetch urgent deadlines (< 30 days)
 */
export function useUrgentDeadlines() {
  return useDeadlines({ urgent: true })
}

/**
 * Fetch KPI summary
 */
export function useKPISummary() {
  return useQuery({
    queryKey: queryKeys.kpiSummary,
    queryFn: () => mockUsptoService.getKPISummary(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Fetch TTAB proceedings for a matter
 */
export function useTTABProceedings(matterId = null) {
  return useQuery({
    queryKey: queryKeys.ttabProceedings(matterId),
    queryFn: () => mockUsptoService.getTTABProceedings(matterId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Update deadline mutation
 */
export function useUpdateDeadline() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ deadlineId, updates }) =>
      mockUsptoService.updateDeadline(deadlineId, updates),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['deadlines'] })
      queryClient.invalidateQueries({ queryKey: ['matters'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.kpiSummary })
    },
  })
}

/**
 * Update matter notes mutation
 */
export function useUpdateMatterNotes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ matterId, notes }) =>
      mockUsptoService.updateMatterNotes(matterId, notes),
    onSuccess: (_, { matterId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matter(matterId) })
    },
  })
}

/**
 * Search matters
 */
export function useSearchMatters(query) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => mockUsptoService.searchMatters(query),
    enabled: query?.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  })
}
