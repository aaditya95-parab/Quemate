import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createBusiness as createBusinessRequest,
  getMyBusinesses,
} from "../api/businessApi";
import { useAuth } from "./AuthContext";
import type {
  Business,
  CreateBusinessRequest,
} from "../types/business";

const CURRENT_BUSINESS_KEY = "currentBusinessId";

interface BusinessContextValue {
  businesses: Business[];
  currentBusiness: Business | null;
  currentBusinessId: string | null;
  isLoadingBusinesses: boolean;
  error: string | null;
  selectBusiness: (businessId: string) => void;
  createBusiness: (
    request: CreateBusinessRequest,
  ) => Promise<Business>;
  refreshBusinesses: () => Promise<void>;
  clearBusinessSelection: () => void;
}

const BusinessContext =
  createContext<BusinessContextValue | undefined>(undefined);

interface BusinessProviderProps {
  children: ReactNode;
}

export function BusinessProvider({
  children,
}: BusinessProviderProps) {
  const { isAuthenticated } = useAuth();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentBusinessId, setCurrentBusinessId] =
    useState<string | null>(() =>
      localStorage.getItem(CURRENT_BUSINESS_KEY),
    );

  const [isLoadingBusinesses, setIsLoadingBusinesses] =
    useState(false);

  const [error, setError] = useState<string | null>(null);

  const selectBusiness = useCallback((businessId: string) => {
    const businessExists = businesses.some(
      (business) => business.id === businessId,
    );

    if (!businessExists) {
      return;
    }

    localStorage.setItem(
      CURRENT_BUSINESS_KEY,
      businessId,
    );

    setCurrentBusinessId(businessId);
  }, [businesses]);

  const clearBusinessSelection = useCallback(() => {
    localStorage.removeItem(CURRENT_BUSINESS_KEY);
    setCurrentBusinessId(null);
  }, []);

  const refreshBusinesses = useCallback(async () => {
    if (!isAuthenticated) {
      setBusinesses([]);
      clearBusinessSelection();
      return;
    }

    setIsLoadingBusinesses(true);
    setError(null);

    try {
      const result = await getMyBusinesses();

      setBusinesses(result);

      const storedBusinessId = localStorage.getItem(
        CURRENT_BUSINESS_KEY,
      );

      const storedBusinessExists = result.some(
        (business) => business.id === storedBusinessId,
      );

      if (storedBusinessId && storedBusinessExists) {
        setCurrentBusinessId(storedBusinessId);
        return;
      }

      if (result.length > 0) {
        const firstBusinessId = result[0].id;

        localStorage.setItem(
          CURRENT_BUSINESS_KEY,
          firstBusinessId,
        );

        setCurrentBusinessId(firstBusinessId);
      } else {
        clearBusinessSelection();
      }
    } catch {
      setError("Could not load your businesses.");
      setBusinesses([]);
      clearBusinessSelection();
    } finally {
      setIsLoadingBusinesses(false);
    }
  }, [isAuthenticated, clearBusinessSelection]);

  const createBusiness = useCallback(
    async (
      request: CreateBusinessRequest,
    ): Promise<Business> => {
      const createdBusiness =
        await createBusinessRequest(request);

      setBusinesses((currentBusinesses) => [
        ...currentBusinesses,
        createdBusiness,
      ]);

      localStorage.setItem(
        CURRENT_BUSINESS_KEY,
        createdBusiness.id,
      );

      setCurrentBusinessId(createdBusiness.id);

      return createdBusiness;
    },
    [],
  );

  useEffect(() => {
    void refreshBusinesses();
  }, [refreshBusinesses]);

  const currentBusiness = useMemo(
    () =>
      businesses.find(
        (business) => business.id === currentBusinessId,
      ) ?? null,
    [businesses, currentBusinessId],
  );

  const value = useMemo(
    () => ({
      businesses,
      currentBusiness,
      currentBusinessId,
      isLoadingBusinesses,
      error,
      selectBusiness,
      createBusiness,
      refreshBusinesses,
      clearBusinessSelection,
    }),
    [
      businesses,
      currentBusiness,
      currentBusinessId,
      isLoadingBusinesses,
      error,
      selectBusiness,
      createBusiness,
      refreshBusinesses,
      clearBusinessSelection,
    ],
  );

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness(): BusinessContextValue {
  const context = useContext(BusinessContext);

  if (!context) {
    throw new Error(
      "useBusiness must be used inside BusinessProvider.",
    );
  }

  return context;
}