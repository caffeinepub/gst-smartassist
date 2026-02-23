import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { T__1, T__6, T__2, T__3, T__5, T__4, T, Category, Slab, Status } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<T__1 | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: T__1) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useCreateGstCalculation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userEmail,
      baseAmount,
      gstSlab,
      isInclusive,
    }: {
      userEmail: string;
      baseAmount: number;
      gstSlab: Slab;
      isInclusive: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createGstCalculation(userEmail, baseAmount, gstSlab, isInclusive);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['calculations', variables.userEmail] });
    },
  });
}

export function useGetCalculationsByUser(userEmail: string) {
  const { actor, isFetching } = useActor();

  return useQuery<T__6[]>({
    queryKey: ['calculations', userEmail],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCalculationsByUser(userEmail);
    },
    enabled: !!actor && !isFetching && !!userEmail,
  });
}

export function useDeleteCalculation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userEmail, timestamp }: { userEmail: string; timestamp: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCalculation(userEmail, timestamp);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['calculations', variables.userEmail] });
    },
  });
}

export function useCreateInvoice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userEmail,
      customerName,
      customerPhone,
      itemName,
      quantity,
      price,
      gstSlab,
    }: {
      userEmail: string;
      customerName: string;
      customerPhone: string;
      itemName: string;
      quantity: bigint;
      price: number;
      gstSlab: Slab;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createInvoice(userEmail, customerName, customerPhone, itemName, quantity, price, gstSlab);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.userEmail] });
    },
  });
}

export function useGetUserInvoices(userEmail: string) {
  const { actor, isFetching } = useActor();

  return useQuery<T__2[]>({
    queryKey: ['invoices', userEmail],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserInvoices(userEmail);
    },
    enabled: !!actor && !isFetching && !!userEmail,
  });
}

export function useDeleteInvoice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invoiceNumber, userEmail }: { invoiceNumber: string; userEmail: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteInvoice(invoiceNumber);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.userEmail] });
    },
  });
}

export function useGetUpcomingDueDates() {
  const { actor, isFetching } = useActor();

  return useQuery<T__3[]>({
    queryKey: ['dueDates'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUpcomingDueDates();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCustomReminder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      dueDate,
      reminderEnabled,
    }: {
      title: string;
      description: string;
      dueDate: bigint;
      reminderEnabled: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCustomReminder(title, description, dueDate, reminderEnabled);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dueDates'] });
      queryClient.invalidateQueries({ queryKey: ['customReminders'] });
    },
  });
}

export function useGetUserCustomReminders() {
  const { actor, isFetching } = useActor();

  return useQuery<T__3[]>({
    queryKey: ['customReminders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserCustomReminders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLearningContentByCategory(category: Category) {
  const { actor, isFetching } = useActor();

  return useQuery<T__5[]>({
    queryKey: ['learningContent', category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLearningContentByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllLearningContent() {
  const { actor, isFetching } = useActor();

  return useQuery<T__5[]>({
    queryKey: ['learningContent', 'all'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLearningContent();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTaxTips() {
  const { actor, isFetching } = useActor();

  return useQuery<T__4[]>({
    queryKey: ['taxTips'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTaxTips();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitCaLead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      phone,
      queryDescription,
      fileUpload,
    }: {
      name: string;
      phone: string;
      queryDescription: string;
      fileUpload: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitCaLead(name, phone, queryDescription, fileUpload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caLeads'] });
    },
  });
}

export function useGetUserCaLeads() {
  const { actor, isFetching } = useActor();

  return useQuery<T[]>({
    queryKey: ['caLeads'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserCaLeads();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateCaLeadStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadKey, newStatus }: { leadKey: string; newStatus: Status }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCaLeadStatus(leadKey, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caLeads'] });
    },
  });
}
