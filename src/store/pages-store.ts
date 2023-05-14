import create from "zustand";

export type AddAndUpdatePagePopupStore = {
    popupState: boolean;
    setPopupState: (isOpen: boolean) => void;
};

export const useAddAndUpdatePagePopupStore = create<AddAndUpdatePagePopupStore>((set) => ({
    popupState: false,
    setPopupState: (isOpen: boolean) => set({ popupState: isOpen }),
}));
