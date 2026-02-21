import { useDispatch, useSelector } from "react-redux";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Pre-typed hooks for common selectors
export const useUsers = () => useAppSelector((state) => state.users);
export const useTransactions = () =>
    useAppSelector((state) => state.transactions);

