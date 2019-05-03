// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import {
  type EnumeratedBehaviorMetadata,
  enumerateBehaviorsMetadata,
} from '../BehaviorsEditor/EnumerateBehaviorsMetadata';

type Props = {|
  project: gdProject,
  value: string,
  onChange: string => void,
  disabled?: boolean,
|};
type State = {|
  behaviorMetadata: Array<EnumeratedBehaviorMetadata>,
|};

export default class BehaviorTypeSelector extends React.Component<
  Props,
  State
> {
  state = {
    behaviorMetadata: enumerateBehaviorsMetadata(
      this.props.project.getCurrentPlatform(),
      this.props.project
    ),
  };

  render() {
    const { disabled, value, onChange } = this.props;
    const { behaviorMetadata } = this.state;

    return (
      <SelectField
        floatingLabelText={<Trans>Behavior type</Trans>}
        floatingLabelFixed
        value={value}
        onChange={(e, i, value) => {
          onChange(value);
        }}
        disabled={disabled}
        fullWidth
      >
        {behaviorMetadata.map((metadata: EnumeratedBehaviorMetadata) => (
          <MenuItem
            key={metadata.type}
            value={metadata.type}
            primaryText={metadata.fullName}
          />
        ))}
      </SelectField>
    );
  }
}