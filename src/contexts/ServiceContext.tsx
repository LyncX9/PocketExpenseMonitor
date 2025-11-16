import React, { createContext, useContext, useEffect, useState } from "react";
import StorageService from "../services/StorageService";
import TransactionManager from "../services/TransactionManager";
import { SettingsManager } from "../services/SettingsManager";
import CurrencyService from "../services/CurrencyService";
import NotificationService from "../services/NotificationService";

export type Services = {
  storageService: StorageService;
  transactionManager: TransactionManager;
  settingsManager: SettingsManager;
  currencyService: CurrencyService;
  notificationService: NotificationService;
};

const storageService = new StorageService();
const settingsManager = new SettingsManager(storageService);
const transactionManager = new TransactionManager(storageService);
const currencyService = new CurrencyService();
const notificationService = new NotificationService();

const ServicesContext = createContext<Services>({
  storageService,
  transactionManager,
  settingsManager,
  currencyService,
  notificationService
});

export const ServicesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialize = async () => {
    await transactionManager.load();
    const s = await settingsManager.load();
    const base: string = s.currency ?? "IDR";
    await currencyService.loadRates(base);
  };

  void initialize();

  return (
    <ServicesContext.Provider
      value={{
        storageService,
        transactionManager,
        settingsManager,
        currencyService,
        notificationService
      }}
    >
      {children}
    </ServicesContext.Provider>
  );
};

export const useServices = () => useContext(ServicesContext);
