import * as server from "@minecraft/server";
import * as serverui from "@minecraft/server-ui";

declare namespace ShulkerInternal {
  type ModalResponse<T extends unknown[]> = serverui.FormResponse & {
    readonly formValues?: T;
  };

  type ModalForm<T extends unknown[]> = {
    /**
     * @remarks
     * Adds a dropdown with choices to the form.
     *
     * This function can't be called in read-only mode.
     */
    dropdown(
      label: server.RawMessage | string,
      options: (server.RawMessage | string)[],
      defaultValueIndex?: number,
    ): ModalForm<[...T, number]>;
    /**
     * @remarks
     * Creates and shows this modal popup form. Returns
     * asynchronously when the player confirms or cancels the
     * dialog.
     *
     * This function can't be called in read-only mode.
     *
     * @param player
     * Player to show this dialog to.
     * @throws This function can throw errors.
     */
    show(player: server.Player): Promise<ModalResponse<T>>;
    /**
     * @remarks
     * Adds a numeric slider to the form.
     *
     * This function can't be called in read-only mode.
     */
    slider(
      label: server.RawMessage | string,
      minimumValue: number,
      maximumValue: number,
      valueStep: number,
      defaultValue?: number,
    ): ModalForm<[...T, number]>;
    submitButton(submitButtonText: server.RawMessage | string): ModalForm<T>;
    /**
     * @remarks
     * Adds a textbox to the form.
     *
     * This function can't be called in read-only mode.
     */
    textField(
      label: server.RawMessage | string,
      placeholderText: server.RawMessage | string,
      defaultValue?: string,
    ): ModalForm<[...T, string]>;
    /**
     * @remarks
     * This builder method sets the title for the modal dialog.
     *
     * This function can't be called in read-only mode.
     */
    title(titleText: server.RawMessage | string): ModalForm<T>;
    /**
     * @remarks
     * Adds a toggle checkbox button to the form.
     *
     * This function can't be called in read-only mode.
     */
    toggle(label: server.RawMessage | string, defaultValue?: boolean): ModalForm<[...T, boolean]>;
  };
}

declare module "@minecraft/server-ui" {
  interface ModalFormData {
    dropdown(
      label: server.RawMessage | string,
      options: (server.RawMessage | string)[],
      defaultValueIndex?: number,
    ): ShulkerInternal.ModalForm<[number]>;
    slider(
      label: server.RawMessage | string,
      minimumValue: number,
      maximumValue: number,
      valueStep: number,
      defaultValue?: number,
    ): ShulkerInternal.ModalForm<[number]>;
    textField(
      label: server.RawMessage | string,
      placeholderText: server.RawMessage | string,
      defaultValue?: string,
    ): ShulkerInternal.ModalForm<[string]>;
    toggle(
      label: server.RawMessage | string,
      defaultValue?: boolean,
    ): ShulkerInternal.ModalForm<[boolean]>;
  }
}
