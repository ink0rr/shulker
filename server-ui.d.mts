import * as server from "@minecraft/server";
import * as serverui from "@minecraft/server-ui";

declare namespace ShulkerInternal {
  type ModalResponse<T extends unknown[]> = serverui.FormResponse & {
    readonly formValues?: T;
  };

  type ModalForm<T extends unknown[]> = {
    /**
     * @remarks
     * Adds a section divider to the form.
     */
    divider(): ShulkerInternal.ModalForm<[...T, never]>;
    /**
     * @remarks
     * Adds a dropdown with choices to the form.
     *
     * This function can't be called in read-only mode.
     */
    dropdown(
      label: server.RawMessage | string,
      items: (server.RawMessage | string)[],
      dropdownOptions?: serverui.ModalFormDataDropdownOptions,
    ): ModalForm<[...T, number]>;
    /**
     * @remarks
     * Adds a header to the form.
     *
     * @param text
     * Text to display.
     */
    header(text: server.RawMessage | string): ShulkerInternal.ModalForm<[...T, never]>;
    /**
     * @remarks
     * Adds a label to the form.
     *
     * @param text
     * Text to display.
     */
    label(text: server.RawMessage | string): ShulkerInternal.ModalForm<[...T, never]>;
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
      sliderOptions?: serverui.ModalFormDataSliderOptions,
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
      textFieldOptions?: serverui.ModalFormDataTextFieldOptions,
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
    toggle(
      label: server.RawMessage | string,
      toggleOptions?: serverui.ModalFormDataToggleOptions,
    ): ModalForm<[...T, boolean]>;
  };
}

declare module "@minecraft/server-ui" {
  interface ModalFormData {
    divider(): ShulkerInternal.ModalForm<[never]>;
    dropdown(
      label: server.RawMessage | string,
      items: (server.RawMessage | string)[],
      dropdownOptions?: ModalFormDataDropdownOptions,
    ): ShulkerInternal.ModalForm<[number]>;
    header(text: server.RawMessage | string): ShulkerInternal.ModalForm<[never]>;
    label(text: server.RawMessage | string): ShulkerInternal.ModalForm<[never]>;
    slider(
      label: server.RawMessage | string,
      minimumValue: number,
      maximumValue: number,
      sliderOptions?: ModalFormDataSliderOptions,
    ): ShulkerInternal.ModalForm<[number]>;
    textField(
      label: server.RawMessage | string,
      placeholderText: server.RawMessage | string,
      textFieldOptions?: ModalFormDataTextFieldOptions,
    ): ShulkerInternal.ModalForm<[string]>;
    toggle(
      label: server.RawMessage | string,
      toggleOptions?: ModalFormDataToggleOptions,
    ): ShulkerInternal.ModalForm<[boolean]>;
  }
}
