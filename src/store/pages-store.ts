import create from "zustand";

export type AddPagePopupStore = {
    popupOpen: boolean;
    setPopupOpen: (isOpen: boolean) => void;
};

export const useAddPagePopupStore = create<AddPagePopupStore>((set) => ({
    popupOpen: false,
    setPopupOpen: (isOpen: boolean) => set({ popupOpen: isOpen }),
}));
