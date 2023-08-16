import { Languages } from "@prisma/client";
import create from "zustand";

export type AddAndUpdatePagePopupStore = {
    popupState: boolean;
    setPopupState: (isOpen: boolean) => void;
};

type activePageLanguage = {
    activePageLanguage: Languages;
    setActivePageLanguage: (language: Languages) => void;
};

export const useAddAndUpdatePagePopupStore = create<AddAndUpdatePagePopupStore>((set) => ({
    popupState: false,
    setPopupState: (isOpen: boolean) => set({ popupState: isOpen }),
}));

export const useActivePageLanguageStore = create<activePageLanguage>((set) => ({
    activePageLanguage: Languages.EN,
    setActivePageLanguage: (language: Languages) => set({ activePageLanguage: language }),
}));
