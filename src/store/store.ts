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
}));

export const usePopupStore = create<PopupStore>((set) => ({
    addInputPopupState: false,
    setAddInputPopupState: (state: boolean) => set({ addInputPopupState: state }),
}));
