import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { exerciseApi, FilterOptions } from '../services/exerciseApi';

export const useExercises = (filters?: FilterOptions) => {
  return useInfiniteQuery({
    queryKey: ['exercises', filters],
    queryFn: ({ pageParam = 0 }) => exerciseApi.getExercises(pageParam, filters),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
};

export const useExerciseById = (id: string) => {
  return useQuery({
    queryKey: ['exercise', id],
    queryFn: () => exerciseApi.getExerciseById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
};

export const useLookups = () => {
  return useQuery({
    queryKey: ['lookups'],
    queryFn: exerciseApi.getLookups,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours cache
  });
};
