import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { booster, session, subscription, transaction, user } from "./schema";

// Insert schemas for each table
export const insertUserSchema = createInsertSchema(user);
export const insertTransactionSchema = createInsertSchema(transaction);
export const insertBoosterSchema = createInsertSchema(booster);
export const insertSessionSchema = createInsertSchema(session);
export const insertSubscriptionSchema = createInsertSchema(subscription);

// Update schemas for each table
export const updateUserSchema = createUpdateSchema(user);
export const updateTransactionSchema = createUpdateSchema(transaction);
export const updateBoosterSchema = createUpdateSchema(booster);
export const updateSessionSchema = createUpdateSchema(session);
export const updateSubscriptionSchema = createUpdateSchema(subscription);
