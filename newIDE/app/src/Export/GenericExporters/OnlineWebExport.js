// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import * as React from 'react';
import Text from '../../UI/Text';
import { Column, Line } from '../../UI/Grid';
import TextField from '../../UI/TextField';
import {
  getBuildArtifactUrl,
  type Build,
} from '../../Utils/GDevelopServices/Build';
import RaisedButton from '../../UI/RaisedButton';
import Window from '../../Utils/Window';
import Copy from '../../UI/CustomSvgIcons/Copy';
import InfoBar from '../../UI/Messages/InfoBar';
import IconButton from '../../UI/IconButton';
import { TextFieldWithButtonLayout } from '../../UI/Layout';

export const ExplanationHeader = () => (
  <Column noMargin alignItems="center" justifyContent="center">
    <Line>
      <Text align="center">
        <Trans>
          Generate a unique link to share your game, for a few days, playable
          from any computer or mobile phone's browser.
        </Trans>
      </Text>
    </Line>
  </Column>
);

type WebProjectLinkProps = {|
  build: ?Build,
  loading: boolean,
|};

export const WebProjectLink = ({ build, loading }: WebProjectLinkProps) => {
  const [showCopiedInfoBar, setShowCopiedInfoBar] = React.useState<boolean>(
    false
  );

  if (!build && !loading) return null;
  const buildPending = loading || (build && build.status !== 'complete');

  const value = buildPending
    ? 'Just a few seconds while we generate the link...'
    : getBuildArtifactUrl(build, 's3Key') || '';

  const onOpen = () => {
    if (buildPending) return;
    Window.openExternalURL(value);
  };

  const onCopy = () => {
    if (buildPending) return;
    // TODO: use Clipboard.js, after it's been reworked to use this API and handle text.
    navigator.clipboard.writeText(value);
    setShowCopiedInfoBar(true);
  };

  return (
    <>
      <TextFieldWithButtonLayout
        noFloatingLabelText
        renderTextField={() => (
          <TextField
            value={value}
            readOnly
            fullWidth
            endAdornment={
              <IconButton
                disabled={!!buildPending}
                onClick={onCopy}
                tooltip={t`Copy`}
                edge="end"
              >
                <Copy />
              </IconButton>
            }
          />
        )}
        renderButton={style => (
          <RaisedButton
            disabled={!!buildPending}
            primary
            label={<Trans>Open</Trans>}
            onClick={onOpen}
            style={style}
          />
        )}
      />
      <InfoBar
        message={<Trans>Copied to clipboard!</Trans>}
        visible={showCopiedInfoBar}
        hide={() => setShowCopiedInfoBar(false)}
      />
    </>
  );
};

export const onlineWebExporter = {
  key: 'onlinewebexport',
  tabName: 'Web',
  name: <Trans>Web (upload online)</Trans>,
  helpPage: '/publishing/web',
};
