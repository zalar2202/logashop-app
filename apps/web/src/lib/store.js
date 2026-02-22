import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "@/features/users/usersSlice";
import notificationsReducer from "@/features/notifications/notificationsSlice";
import productsReducer from "@/features/products/productsSlice";

// Import other slices here as we create them
// import transactionsReducer from "@/features/transactions/transactionsSlice";

export const makeStore = () => {
    return configureStore({
        reducer: {
            users: usersReducer,
            notifications: notificationsReducer,
            products: productsReducer,
            // Add other reducers here as we create them
            // transactions: transactionsReducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    // Ignore these action types for non-serializable values
                    ignoredActions: [],
                },
            }),
        devTools: process.env.NODE_ENV !== "production",
    });
};

// Infer the type of makeStore
export const store = makeStore();

// Infer the `RootState` and `AppDispatch` types from the store itself
export const selectUsers = (state) => state.users;
export const selectNotifications = (state) => state.notifications;
export const selectTransactions = (state) => state.transactions;
