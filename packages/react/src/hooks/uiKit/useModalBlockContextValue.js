import { useDebouncedCallback } from '@rocket.chat/fuselage-hooks';
import { useContext } from 'react';
import RCContext from '../../context/RCInstance';

export const useModalContextValue = ({ view, values, updateValues }) => {
  const { RCInstance } = useContext(RCContext);

  const debouncedTriggerAction = useDebouncedCallback(async (params) => {
    await RCInstance?.handleUiKitInteraction(params);
  }, 700);

  return {
    action: async ({
      actionId,
      viewId,
      appId,
      dispatchActionConfig,
      blockId,
      value,
    }) => {
      if (!appId || !viewId) {
        return;
      }

      const triggerAction = dispatchActionConfig?.includes(
        'on_character_entered'
      )
        ? debouncedTriggerAction
        : async (params) => {
            await RCInstance?.handleUiKitInteraction(params);
          };

      await triggerAction({
        appId,
        type: 'blockAction',
        actionId,
        container: {
          type: 'view',
          id: viewId,
        },
        payload: {
          blockId,
          value,
        },
      });
    },
    updateState: ({ actionId, value, blockId = 'default' }) => {
      updateValues({
        actionId,
        payload: {
          blockId,
          value,
        },
      });
    },
    ...view,
    values,
    viewId: view.id,
  };
};
