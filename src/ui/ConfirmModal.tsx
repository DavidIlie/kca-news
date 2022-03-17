import React, { useState } from "react";
import Modal, { ModalProps } from "./Modal";

interface Props extends Partial<ModalProps> {
    isOpen: boolean;
    updateModalState: () => void;
    successFunction: () => void;
}

const ConfirmModal: React.FC<Props> = ({
    isOpen,
    updateModalState,
    successFunction,
    ...rest
}) => {
    const [string, setString] = useState<string>("Nevermind");
    const [delayHandler, setDelayHandler] = useState<any>(null);

    return (
        <Modal
            isOpen={isOpen}
            updateModalState={updateModalState}
            title="Are you sure?"
            {...rest}
        >
            <>
                <div className="mt-2">
                    <h1 className="text-gray-800">
                        There is no going back once you do this.
                    </h1>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                    <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-sky-200 px-4 py-2 text-sm font-medium text-sky-900 duration-150 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={() => {
                            updateModalState();
                            setString("Nevermind");
                        }}
                        onMouseEnter={() =>
                            setDelayHandler(
                                setTimeout(() => {
                                    setString("It's a no from me");
                                }, 5000)
                            )
                        }
                        onMouseLeave={() => clearTimeout(delayHandler)}
                    >
                        {string}
                    </button>
                    <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-red-200 px-4 py-2 text-sm font-medium text-red-900 duration-150 hover:bg-red-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={() => {
                            successFunction();
                            updateModalState();
                        }}
                    >
                        Confirm
                    </button>
                </div>
            </>
        </Modal>
    );
};

export default ConfirmModal;
