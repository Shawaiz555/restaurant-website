import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import notificationReducer from './slices/notificationSlice';
import ordersReducer from './slices/ordersSlice';
import productsReducer from './slices/productsSlice';
import expensesReducer from './slices/expensesSlice';
import tablesReducer from './slices/tablesSlice';
import reservationsReducer from './slices/reservationsSlice';
import dealsReducer from './slices/dealsSlice';
import ingredientsReducer from './slices/ingredientsSlice';
import suppliersReducer from './slices/suppliersSlice';
import purchasesReducer from './slices/purchasesSlice';
import recipesReducer from './slices/recipesSlice';
import wastageReducer from './slices/wastageSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    notification: notificationReducer,
    orders: ordersReducer,
    products: productsReducer,
    expenses: expensesReducer,
    tables: tablesReducer,
    reservations: reservationsReducer,
    deals: dealsReducer,
    ingredients: ingredientsReducer,
    suppliers: suppliersReducer,
    purchases: purchasesReducer,
    recipes: recipesReducer,
    wastage: wastageReducer,
  },
});

export default store;
