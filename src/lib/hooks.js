import { useDispatch, useSelector } from "react-redux";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Pre-typed hooks for common selectors
export const useUsers = () => useAppSelector((state) => state.users);
export const useCompanies = () => useAppSelector((state) => state.companies);
export const useTransactions = () =>
    useAppSelector((state) => state.transactions);
export const usePackages = () => useAppSelector((state) => state.packages);
export const usePayments = () => useAppSelector((state) => state.payments);
export const usePromotions = () =>
    useAppSelector((state) => state.promotions);

