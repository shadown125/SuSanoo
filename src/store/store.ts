import create from "zustand";

type NotificationStore = {
    notificationState: boolean;
    setNotificationState: (state: boolean) => void;
    notificationError: boolean;
    setNotificationError: (state: boolean) => void;
    notificationMessage: string;
    setNotificationMessage: (text: string) => void;
    pageEditState: boolean;
};

type DetailPageStore = {
    editState: boolean;
    setEditState: (state: boolean) => void;
    componentId: string;
    setComponentId: (id: string) => void;
    addComponentItemPopup: boolean;
    setAddComponentItemPopup: (state: boolean) => void;
    componentItemId: string;
    setComponentItemId: (id: string) => void;
    updateComponentItemPopup: boolean;
    setUpdateComponentItemPopup: (state: boolean) => void;
};

type PopupStore = {
    addInputPopupState: boolean;
    setAddInputPopupState: (state: boolean) => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
    notificationState: false,
    setNotificationState: (state: boolean) => set({ notificationState: state }),
    notificationError: false,
    setNotificationError: (state: boolean) => set({ notificationError: state }),
    notificationMessage: "",
    setNotificationMessage: (text: string) => set({ notificationMessage: text }),
    pageEditState: false,
}));

export const useDetailPageStore = create<DetailPageStore>((set) => ({
    editState: false,
    setEditState: (state: boolean) => set({ editState: state }),
    componentId: "",
    setComponentId: (id: string) => set({ componentId: id }),
    addComponentItemPopup: false,
    setAddComponentItemPopup: (state: boolean) => set({ addComponentItemPopup: state }),
    componentItemId: "",
    setComponentItemId: (id: string) => set({ componentItemId: id }),
    updateComponentItemPopup: false,
    setUpdateComponentItemPopup: (state: boolean) => set({ updateComponentItemPopup: state }),
}));

export const usePopupStore = create<PopupStore>((set) => ({
    addInputPopupState: false,
    setAddInputPopupState: (state: boolean) => set({ addInputPopupState: state }),
}));
