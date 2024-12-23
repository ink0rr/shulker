import * as minecraftserver from "@minecraft/server";
import { FormResponse } from "@minecraft/server-ui";

declare module "@minecraft/server-ui" {
  type ModalResponse<T> = FormResponse & {
    readonly formValues?: T;
  };

  type ModalForm<T> = {
    /**
     * @remarks
     * Adds a dropdown with choices to the form.
     *
     * This function can't be called in read-only mode.
     */
    dropdown(
      label: minecraftserver.RawMessage | string,
      options: (minecraftserver.RawMessage | string)[],
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
    show(player: minecraftserver.Player): Promise<ModalResponse<T>>;
    /**
     * @remarks
     * Adds a numeric slider to the form.
     *
     * This function can't be called in read-only mode.
     */
    slider(
      label: minecraftserver.RawMessage | string,
      minimumValue: number,
      maximumValue: number,
      valueStep: number,
      defaultValue?: number,
    ): ModalForm<[...T, number]>;
    submitButton(submitButtonText: minecraftserver.RawMessage | string): ModalForm<T>;
    /**
     * @remarks
     * Adds a textbox to the form.
     *
     * This function can't be called in read-only mode.
     */
    textField(
      label: minecraftserver.RawMessage | string,
      placeholderText: minecraftserver.RawMessage | string,
      defaultValue?: string,
    ): ModalForm<[...T, string]>;
    /**
     * @remarks
     * This builder method sets the title for the modal dialog.
     *
     * This function can't be called in read-only mode.
     */
    title(titleText: minecraftserver.RawMessage | string): ModalForm<T>;
    /**
     * @remarks
     * Adds a toggle checkbox button to the form.
     *
     * This function can't be called in read-only mode.
     */
    toggle(
      label: minecraftserver.RawMessage | string,
      defaultValue?: boolean,
    ): ModalForm<[...T, boolean]>;
  };

  interface ModalFormData {
    dropdown(
      label: minecraftserver.RawMessage | string,
      options: (minecraftserver.RawMessage | string)[],
      defaultValueIndex?: number,
    ): ModalForm<[number]>;
    slider(
      label: minecraftserver.RawMessage | string,
      minimumValue: number,
      maximumValue: number,
      valueStep: number,
      defaultValue?: number,
    ): ModalForm<[number]>;
    textField(
      label: minecraftserver.RawMessage | string,
      placeholderText: minecraftserver.RawMessage | string,
      defaultValue?: string,
    ): ModalForm<[string]>;
    toggle(
      label: minecraftserver.RawMessage | string,
      defaultValue?: boolean,
    ): ModalForm<[boolean]>;
  }
}
