import { FC } from "react";
import { useNotificationStore } from "../src/store/store";
import shallow from "zustand/shallow";

const Notification: FC = () => {
    const { notificationMessage, notificationState, isNotificationErorr } = useNotificationStore(
        (state) => ({
            notificationMessage: state.notificationMessage,
            notificationState: state.notificationState,
            isNotificationErorr: state.notificationError,
        }),
        shallow,
    );

    return (
        <div className={`notification-message${isNotificationErorr ? " is-error" : ""}`}>
            <div className={`notification${notificationState ? " is-active" : ""}`}>{notificationMessage}</div>
        </div>
    );
};

export default Notification;
