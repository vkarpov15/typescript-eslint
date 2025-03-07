import React, { useCallback, useEffect, useState } from 'react';

import { shallowEqual } from '../lib/shallowEqual';
import type { ConfigModel, TSConfig } from '../types';
import type { ConfigOptionsType } from './ConfigEditor';
import ConfigEditor from './ConfigEditor';
import { getTypescriptOptions, parseTSConfig, toJson } from './utils';

interface ConfigTypeScriptProps {
  readonly isOpen: boolean;
  readonly onClose: (config?: Partial<ConfigModel>) => void;
  readonly config?: string;
}

function ConfigTypeScript(props: ConfigTypeScriptProps): JSX.Element {
  const [tsConfigOptions, updateOptions] = useState<ConfigOptionsType[]>([]);
  const [configObject, updateConfigObject] = useState<TSConfig>();

  useEffect(() => {
    if (props.isOpen) {
      updateConfigObject(parseTSConfig(props.config));
    }
  }, [props.isOpen, props.config]);

  useEffect(() => {
    if (window.ts) {
      updateOptions(
        Object.values(
          getTypescriptOptions().reduce<Record<string, ConfigOptionsType>>(
            (group, item) => {
              const category = item.category!.message;
              group[category] = group[category] ?? {
                heading: category,
                fields: [],
              };
              if (item.type === 'boolean') {
                group[category].fields.push({
                  key: item.name,
                  type: 'boolean',
                  label: item.description!.message,
                });
              } else if (item.type instanceof Map) {
                group[category].fields.push({
                  key: item.name,
                  type: 'string',
                  label: item.description!.message,
                  enum: ['', ...Array.from<string>(item.type.keys())],
                });
              }
              return group;
            },
            {},
          ),
        ),
      );
    }
  }, [props.isOpen]);

  const onClose = useCallback(
    (newConfig: Record<string, unknown>) => {
      const cfg = { ...newConfig };
      if (!shallowEqual(cfg, configObject?.compilerOptions)) {
        props.onClose({
          tsconfig: toJson({ ...(configObject ?? {}), compilerOptions: cfg }),
        });
      } else {
        props.onClose();
      }
    },
    [props.onClose, configObject],
  );

  return (
    <ConfigEditor
      header="TypeScript Config"
      options={tsConfigOptions}
      values={configObject?.compilerOptions ?? {}}
      isOpen={props.isOpen}
      onClose={onClose}
    />
  );
}

export default ConfigTypeScript;
