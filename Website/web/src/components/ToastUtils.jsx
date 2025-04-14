import { toast } from "react-toastify";

export const showSuccess = (message) => {
    toast.success(message, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        pauseOnHover: true,
        draggable: true,
    });
};

export const showError = (message) => {
    toast.error(message, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        pauseOnHover: true,
        draggable: true,
    });
};

export const showInfo = (message) => {
    toast.info(message, {
        position: "bottom-right",
        autoClose: 3000,
    });
};
