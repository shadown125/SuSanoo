import create from "zustand";

export type ComponentsStore = {
    componentId: string;
    setComponentId: (id: string) => void;
    isEditPopupOpen: boolean;
    setIsEditPopupOpen: (isOpen: boolean) => void;
    editInputId: string;
    setEditInputId: (id: string) => void;
    isItemInput: boolean;
    setIsItemInput: (isItemInput: boolean) => void;
};

export const useComponentsStore = create<ComponentsStore>((set) => ({
    componentId: "",
    setComponentId: (id: string) => set({ componentId: id }),
    isEditPopupOpen: false,
    setIsEditPopupOpen: (isOpen: boolean) => set({ isEditPopupOpen: isOpen }),
    editInputId: "",
    setEditInputId: (id: string) => set({ editInputId: id }),
    isItemInput: false,
    setIsItemInput: (isItemInput: boolean) => set({ isItemInput: isItemInput }),
}));
